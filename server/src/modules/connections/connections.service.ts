import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { CommunityTier } from '../iam/enums/roles.enum';
import { SendConnectionRequestDto, RespondToConnectionDto } from './dto/connection.dto';
import { MailService } from '../../common/mail/mail.service';

/** Paid tiers that can initiate connection requests */
const PAID_TIERS: CommunityTier[] = [
    CommunityTier.UBUNTU,
    CommunityTier.IMANI,
    CommunityTier.KIONGOZI,
];

@Injectable()
export class ConnectionsService {
    constructor(
        @InjectModel(Connection) private connectionRepo: typeof Connection,
        @InjectModel(User) private userRepo: typeof User,
        private mailService: MailService,
    ) { }

    // ─── GUARD: Ensure requesting user is a paid member ─────────────────────────
    private assertPaidMember(user: User) {
        if (!PAID_TIERS.includes(user.communityTier)) {
            throw new ForbiddenException(
                'Only paid TATT members (Ubuntu, Imani or Kiongozi tier) can send connection requests.',
            );
        }
    }

    // ─── SEND CONNECTION REQUEST ─────────────────────────────────────────────────
    async sendRequest(requester: User, dto: SendConnectionRequestDto) {
        this.assertPaidMember(requester);

        if (requester.id === dto.recipientId) {
            throw new BadRequestException('You cannot send a connection request to yourself.');
        }

        const recipient = await this.userRepo.findByPk(dto.recipientId, {
            attributes: ['id', 'firstName', 'lastName', 'email', 'communityTier', 'isActive'],
        });

        if (!recipient || !recipient.isActive) {
            throw new NotFoundException('The member you are trying to connect with was not found.');
        }

        // Check for an existing active (non-withdrawn/non-declined) request between the pair
        const existing = await this.connectionRepo.findOne({
            where: {
                [Op.or]: [
                    { requesterId: requester.id, recipientId: dto.recipientId },
                    { requesterId: dto.recipientId, recipientId: requester.id },
                ],
                status: {
                    [Op.notIn]: [ConnectionStatus.DECLINED, ConnectionStatus.WITHDRAWN],
                },
            },
        });

        if (existing) {
            if (existing.status === ConnectionStatus.ACCEPTED) {
                throw new ConflictException('You are already connected with this member.');
            }
            throw new ConflictException('A pending connection request already exists between you and this member.');
        }

        const connection = await this.connectionRepo.create({
            requesterId: requester.id,
            recipientId: dto.recipientId,
            message: dto.message,
            status: ConnectionStatus.PENDING,
        });

        // Notify the recipient via email (non-blocking)
        this.mailService
            .sendConnectionRequest(
                recipient.email,
                recipient.firstName,
                `${requester.firstName} ${requester.lastName}`,
                dto.message,
            )
            .catch(() => { /* Silently swallow — connection was still created */ });

        return {
            message: 'Connection request sent successfully.',
            connectionId: connection.id,
        };
    }

    // ─── RESPOND TO A REQUEST (ACCEPT / DECLINE) ─────────────────────────────────
    async respondToRequest(currentUser: User, connectionId: string, dto: RespondToConnectionDto) {
        const connection = await this.connectionRepo.findByPk(connectionId);

        if (!connection) {
            throw new NotFoundException('Connection request not found.');
        }

        if (connection.recipientId !== currentUser.id) {
            throw new ForbiddenException('You are not authorised to respond to this connection request.');
        }

        if (connection.status !== ConnectionStatus.PENDING) {
            throw new BadRequestException(
                `This request has already been ${connection.status.toLowerCase()} and cannot be updated.`,
            );
        }

        connection.status = dto.status;
        await connection.save();

        return {
            message: `Connection request ${dto.status.toLowerCase()} successfully.`,
        };
    }

    // ─── WITHDRAW A SENT REQUEST ─────────────────────────────────────────────────
    async withdrawRequest(currentUser: User, connectionId: string) {
        const connection = await this.connectionRepo.findByPk(connectionId);

        if (!connection) {
            throw new NotFoundException('Connection request not found.');
        }

        if (connection.requesterId !== currentUser.id) {
            throw new ForbiddenException('You can only withdraw your own connection requests.');
        }

        if (connection.status !== ConnectionStatus.PENDING) {
            throw new BadRequestException(
                `You can only withdraw pending requests. This request is already ${connection.status.toLowerCase()}.`,
            );
        }

        connection.status = ConnectionStatus.WITHDRAWN;
        await connection.save();

        return { message: 'Connection request withdrawn.' };
    }

    // ─── REMOVE A CONNECTION (DISCONNECT) ────────────────────────────────────────
    async removeConnection(currentUser: User, connectionId: string) {
        const connection = await this.connectionRepo.findByPk(connectionId);

        if (!connection) {
            throw new NotFoundException('Connection not found.');
        }

        const isParticipant =
            connection.requesterId === currentUser.id ||
            connection.recipientId === currentUser.id;

        if (!isParticipant) {
            throw new ForbiddenException('You are not part of this connection.');
        }

        if (connection.status !== ConnectionStatus.ACCEPTED) {
            throw new BadRequestException('You can only remove an active connection.');
        }

        await connection.destroy();

        return { message: 'Connection removed successfully.' };
    }

    // ─── GET MY NETWORK (ACCEPTED CONNECTIONS) ───────────────────────────────────
    async getMyNetwork(currentUser: User) {
        const connections = await this.connectionRepo.findAll({
            where: {
                [Op.or]: [
                    { requesterId: currentUser.id },
                    { recipientId: currentUser.id },
                ],
                status: ConnectionStatus.ACCEPTED,
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'companyName', 'location', 'tattMemberId', 'communityTier'],
                },
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'companyName', 'location', 'tattMemberId', 'communityTier'],
                },
            ],
        });

        // Normalise: return the "other person" in each connection from the perspective of currentUser
        return connections.map((conn) => {
            const connectedMember =
                conn.requesterId === currentUser.id ? conn.recipient : conn.requester;
            return {
                connectionId: conn.id,
                connectedSince: conn.updatedAt,
                member: connectedMember,
            };
        });
    }

    // ─── GET PENDING REQUESTS (INCOMING) ─────────────────────────────────────────
    async getIncomingRequests(currentUser: User) {
        return this.connectionRepo.findAll({
            where: {
                recipientId: currentUser.id,
                status: ConnectionStatus.PENDING,
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'companyName', 'location', 'tattMemberId', 'communityTier'],
                },
            ],
        });
    }

    // ─── GET SENT REQUESTS (OUTGOING) ────────────────────────────────────────────
    async getSentRequests(currentUser: User) {
        return this.connectionRepo.findAll({
            where: {
                requesterId: currentUser.id,
                status: ConnectionStatus.PENDING,
            },
            include: [
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'companyName', 'location', 'tattMemberId', 'communityTier'],
                },
            ],
        });
    }

    // ─── CHECK CONNECTION STATUS WITH A SPECIFIC MEMBER ─────────────────────────
    async getConnectionStatus(currentUser: User, memberId: string) {
        const connection = await this.connectionRepo.findOne({
            where: {
                [Op.or]: [
                    { requesterId: currentUser.id, recipientId: memberId },
                    { requesterId: memberId, recipientId: currentUser.id },
                ],
            },
        });

        if (!connection) {
            return { status: 'NOT_CONNECTED', connectionId: null };
        }

        return {
            status: connection.status,
            connectionId: connection.id,
            initiatedBy: connection.requesterId === currentUser.id ? 'ME' : 'THEM',
        };
    }

    // ─── GET ALL MEMBERS (DIRECTORY) ─────────────────────────────────────────────
    async getAllMembers(query: any, excludeUserId?: string) {
        const { search, chapterId, industry, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;

        const where: any = {
            isActive: true,
            // Exclude the requesting user from their own directory view
            ...(excludeUserId ? { id: { [Op.ne]: excludeUserId } } : {}),
        };

        if (chapterId) {
            where.chapterId = chapterId;
        }

        if (industry) {
            where.industry = industry;
        }

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { professionTitle: { [Op.iLike]: `%${search}%` } },
                { companyName: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { rows: members, count: total } = await this.userRepo.findAndCountAll({
            where,
            attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'companyName', 'location', 'tattMemberId', 'communityTier', 'industry', 'chapterId'],
            include: [
                {
                    model: Chapter,
                    as: 'chapter',
                    attributes: ['id', 'name', 'code'],
                    required: false,
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        return {
            members,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ─── GET MEMBER PUBLIC PROFILE ────────────────────────────────────────────────
    async getMemberProfile(memberId: string) {
        const member = await this.userRepo.findByPk(memberId, {
            attributes: [
                'id', 'firstName', 'lastName', 'profilePicture', 'professionTitle',
                'companyName', 'location', 'tattMemberId', 'communityTier', 'industry',
                'chapterId', 'professionalHighlight',
            ],
            include: [
                {
                    model: Chapter,
                    as: 'chapter',
                    attributes: ['id', 'name', 'code'],
                    required: false,
                }
            ],
        });

        if (!member || !member.isActive) {
            throw new NotFoundException('Member not found.');
        }

        return member;
    }
}
