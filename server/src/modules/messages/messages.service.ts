import {
    Injectable, Logger, NotFoundException,
    ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DirectMessage, MessageStatus } from './entities/direct-message.entity';
import { Connection, ConnectionStatus } from '../connections/entities/connection.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { SendMessageDto, MessageHistoryQueryDto } from './dto/messages.dto';

// Profile fields returned in conversation list and message sender context
const PARTNER_ATTRS = [
    'id', 'firstName', 'lastName', 'profilePicture',
    'professionTitle', 'companyName', 'communityTier',
    'tattMemberId', 'chapterId',
] as const;

const CHAPTER_ATTRS = ['id', 'name', 'code'] as const;

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);

    constructor(
        @InjectModel(DirectMessage) private messageRepo: typeof DirectMessage,
        @InjectModel(Connection) private connectionRepo: typeof Connection,
        @InjectModel(User) private userRepo: typeof User,
    ) { }

    // ════════════════════════════════════════════════════════════════════════════
    //  GUARD: Verify caller is a participant of an ACCEPTED connection
    // ════════════════════════════════════════════════════════════════════════════

    async assertConnectedParticipant(userId: string, connectionId: string): Promise<Connection> {
        const conn = await this.connectionRepo.findByPk(connectionId);

        if (!conn) throw new NotFoundException('Conversation not found.');

        if (conn.status !== ConnectionStatus.ACCEPTED) {
            throw new ForbiddenException(
                "Messaging is only available between members who have accepted each other's connection request.",
            );
        }

        if (conn.requesterId !== userId && conn.recipientId !== userId) {
            throw new ForbiddenException('You are not a participant in this conversation.');
        }

        return conn;
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  SEND A MESSAGE (REST — used for initial send & queue resend)
    // ════════════════════════════════════════════════════════════════════════════

    async sendMessage(sender: User, connectionId: string, dto: SendMessageDto): Promise<DirectMessage> {
        const conn = await this.assertConnectedParticipant(sender.id, connectionId);

        if (!dto.content?.trim() && (!dto.mediaUrls || dto.mediaUrls.length === 0)) {
            throw new BadRequestException('A message must have either text content or at least one attachment.');
        }

        const receiverId = conn.requesterId === sender.id ? conn.recipientId : conn.requesterId;

        // ── Deduplication for queue/resend ────────────────────────────────────
        if (dto.clientMessageId) {
            const existing = await this.messageRepo.findOne({
                where: { senderId: sender.id, clientMessageId: dto.clientMessageId },
            });
            if (existing) {
                this.logger.log(`Resend detected — returning existing message ${existing.id}`);
                return existing;
            }
        }

        const message = await this.messageRepo.create({
            connectionId,
            senderId: sender.id,
            receiverId,
            content: dto.content?.trim() ?? null,
            mediaUrls: dto.mediaUrls ?? [],
            status: MessageStatus.SENT,
            clientMessageId: dto.clientMessageId ?? null,
        });

        return message;
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  CONVERSATION LIST
    // ════════════════════════════════════════════════════════════════════════════

    async getConversations(userId: string) {
        // All accepted connections this user is part of
        const connections = await this.connectionRepo.findAll({
            where: {
                [Op.or]: [{ requesterId: userId }, { recipientId: userId }],
                status: ConnectionStatus.ACCEPTED,
            },
            attributes: ['id', 'requesterId', 'recipientId', 'updatedAt'],
        });

        if (!connections.length) return [];

        const connectionIds = connections.map((c) => c.id);

        // Get latest message per connection (subquery via findAll + group workaround)
        const lastMessages = await this.messageRepo.findAll({
            where: { connectionId: { [Op.in]: connectionIds } },
            order: [['createdAt', 'DESC']],
        });

        // Index by connectionId → most recent message
        const lastMsgMap = new Map<string, DirectMessage>();
        for (const msg of lastMessages) {
            if (!lastMsgMap.has(msg.connectionId)) {
                lastMsgMap.set(msg.connectionId, msg);
            }
        }

        // Unread counts: messages where receiverId = me AND (status != READ OR isManuallyUnread = true)
        const unreadMessages = await this.messageRepo.findAll({
            where: {
                connectionId: { [Op.in]: connectionIds },
                receiverId: userId,
                [Op.or]: [
                    { status: { [Op.ne]: MessageStatus.READ } },
                    { isManuallyUnread: true },
                ],
            },
            attributes: ['connectionId'],
        });

        const unreadCountMap = new Map<string, number>();
        for (const msg of unreadMessages) {
            unreadCountMap.set(msg.connectionId, (unreadCountMap.get(msg.connectionId) ?? 0) + 1);
        }

        // Load partner profiles for all connections in one query
        const partnerIds = connections.map((c) =>
            c.requesterId === userId ? c.recipientId : c.requesterId,
        );

        const partners = await this.userRepo.findAll({
            where: { id: { [Op.in]: partnerIds } },
            attributes: [...PARTNER_ATTRS],
            include: [{ model: Chapter, as: 'chapter', attributes: [...CHAPTER_ATTRS], required: false }],
        });

        const partnerMap = new Map(partners.map((p) => [p.id, p]));

        // Assemble conversation list sorted by last activity
        const conversations = connections.map((conn) => {
            const partnerId = conn.requesterId === userId ? conn.recipientId : conn.requesterId;
            const partner = partnerMap.get(partnerId);
            const lastMsg = lastMsgMap.get(conn.id) ?? null;
            const unreadCount = unreadCountMap.get(conn.id) ?? 0;

            return {
                connectionId: conn.id,
                partner: partner ? this.formatPartner(partner) : null,
                lastMessage: lastMsg,
                unreadCount,
                lastActivityAt: lastMsg?.createdAt ?? conn.updatedAt,
            };
        });

        // Sort: most recent activity first
        conversations.sort((a, b) =>
            new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
        );

        return conversations;
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  MESSAGE HISTORY
    // ════════════════════════════════════════════════════════════════════════════

    async getHistory(userId: string, connectionId: string, query: MessageHistoryQueryDto) {
        await this.assertConnectedParticipant(userId, connectionId);

        const { page = 1, limit = 30 } = query;
        const offset = (page - 1) * limit;

        const { count, rows } = await this.messageRepo.findAndCountAll({
            where: { connectionId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            data: rows,
            meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        };
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  MARK MESSAGES AS READ
    // ════════════════════════════════════════════════════════════════════════════

    async markRead(userId: string, connectionId: string, messageIds: string[]): Promise<string[]> {
        await this.assertConnectedParticipant(userId, connectionId);

        const now = new Date();
        await this.messageRepo.update(
            {
                status: MessageStatus.READ,
                readAt: now,
                isManuallyUnread: false,
            },
            {
                where: {
                    id: { [Op.in]: messageIds },
                    connectionId,
                    receiverId: userId,          // Can only mark OWN received messages as read
                    status: { [Op.ne]: MessageStatus.READ },
                },
            },
        );

        return messageIds;
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  MARK MESSAGE AS UNREAD (manual "mark unread" feature)
    // ════════════════════════════════════════════════════════════════════════════

    async markUnread(userId: string, messageId: string): Promise<void> {
        const message = await this.messageRepo.findByPk(messageId);
        if (!message) throw new NotFoundException('Message not found.');
        if (message.receiverId !== userId) {
            throw new ForbiddenException('You can only mark your own received messages as unread.');
        }

        message.isManuallyUnread = true;
        await message.save();
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  UPDATE DELIVERY STATUS (called by Gateway on real-time delivery)
    // ════════════════════════════════════════════════════════════════════════════

    async markDelivered(messageIds: string[]): Promise<void> {
        await this.messageRepo.update(
            { status: MessageStatus.DELIVERED, deliveredAt: new Date() },
            {
                where: {
                    id: { [Op.in]: messageIds },
                    status: MessageStatus.SENT,  // Only advance SENT → DELIVERED
                },
            },
        );
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  DELETE A MESSAGE (soft-delete — own messages only)
    // ════════════════════════════════════════════════════════════════════════════

    async deleteMessage(userId: string, messageId: string): Promise<void> {
        const message = await this.messageRepo.findByPk(messageId);
        if (!message) throw new NotFoundException('Message not found.');
        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only delete messages you sent.');
        }

        await message.destroy();
    }

    // ════════════════════════════════════════════════════════════════════════════
    //  GET PARTNER PROFILE (for chat header)
    // ════════════════════════════════════════════════════════════════════════════

    async getPartnerProfile(userId: string, connectionId: string) {
        const conn = await this.assertConnectedParticipant(userId, connectionId);
        const partnerId = conn.requesterId === userId ? conn.recipientId : conn.requesterId;

        const partner = await this.userRepo.findByPk(partnerId, {
            attributes: [...PARTNER_ATTRS],
            include: [{ model: Chapter, as: 'chapter', attributes: [...CHAPTER_ATTRS], required: false }],
        });

        if (!partner) throw new NotFoundException('Partner profile not found.');
        return this.formatPartner(partner);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private formatPartner(user: User) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture ?? null,
            professionTitle: user.professionTitle ?? null,
            companyName: user.companyName ?? null,
            communityTier: user.communityTier,
            tattMemberId: user.tattMemberId,
            chapter: (user as any).chapter
                ? {
                    id: (user as any).chapter.id,
                    name: (user as any).chapter.name,
                    code: (user as any).chapter.code,
                }
                : null,
        };
    }
}
