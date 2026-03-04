import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { SystemRole, CommunityTier } from '../enums/roles.enum';
import { Op } from 'sequelize';
import { Chapter } from '../../chapters/entities/chapter.entity';
import { ProfessionalInterest } from '../../interests/entities/interest.entity';
import { UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
    ) { }

    async findAllOrgMembers(query: { search?: string; role?: string; isActive?: boolean; chapterId?: string }) {
        const where: any = {
            systemRole: { [Op.ne]: SystemRole.COMMUNITY_MEMBER },
        };

        if (query.search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${query.search}%` } },
                { lastName: { [Op.iLike]: `%${query.search}%` } },
                { email: { [Op.iLike]: `%${query.search}%` } },
            ];
        }

        if (query.role) {
            where.systemRole = query.role;
        }

        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }

        if (query.chapterId) {
            where.chapterId = query.chapterId;
        }

        return this.userRepository.findAll({
            where,
            include: [{ model: Chapter, attributes: ['id', 'name', 'code'] }],
            order: [['createdAt', 'DESC']],
        });
    }

    async findOne(id: string) {
        const user = await this.userRepository.findByPk(id, {
            include: [{ model: Chapter, attributes: ['id', 'name', 'code'] }],
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, updateData: Partial<User>) {
        const user = await this.findOne(id);
        return user.update(updateData);
    }

    async getProfile(userId: string) {
        const user = await this.userRepository.findByPk(userId, {
            include: [
                { model: Chapter, attributes: ['id', 'name', 'code'] },
                { model: ProfessionalInterest, attributes: ['id', 'name'], through: { attributes: [] } }
            ],
            attributes: { exclude: ['password', 'twoFactorSecret', 'pendingTotpSecret'] }
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.userRepository.findByPk(userId);
        if (!user) throw new NotFoundException('User not found');

        const { interests, ...profileData } = dto;

        // Security: only Kiongozi can manage business info
        if (user.communityTier !== CommunityTier.KIONGOZI) {
            delete (profileData as any).businessName;
            delete (profileData as any).businessRole;
            delete (profileData as any).businessProfileLink;
        }

        await user.update(profileData);

        if (interests) {
            await (user as any).setInterests(interests);
        }

        return this.getProfile(userId);
    }

    async requestDeletion(userId: string) {
        const user = await this.userRepository.findByPk(userId);
        if (!user) throw new NotFoundException('User not found');

        user.deletionRequestedAt = new Date();
        await user.save();

        return { message: 'Account scheduled for deletion. You have 14 days to cancel this request.' };
    }

    async cancelDeletion(userId: string) {
        const user = await this.userRepository.findByPk(userId);
        if (!user) throw new NotFoundException('User not found');

        user.deletionRequestedAt = null;
        await user.save();

        return { message: 'Account deletion request cancelled.' };
    }

    async getStats() {
        const totalStaff = await this.userRepository.count({
            where: { systemRole: { [Op.ne]: SystemRole.COMMUNITY_MEMBER } },
        });

        const activeAdmins = await this.userRepository.count({
            where: {
                systemRole: { [Op.in]: [SystemRole.ADMIN, SystemRole.SUPERADMIN] },
                isActive: true,
            },
        });

        const pendingApprovals = await this.userRepository.count({
            where: { isActive: false, systemRole: { [Op.ne]: SystemRole.COMMUNITY_MEMBER } },
        });

        const regionalChapters = await Chapter.count();

        return {
            totalStaff,
            activeAdmins,
            pendingApprovals,
            regionalChapters,
        };
    }
}
