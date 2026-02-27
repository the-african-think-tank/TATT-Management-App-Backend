import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { VolunteerRole } from './entities/volunteer-role.entity';
import { VolunteerApplication, ApplicationStatus } from './entities/volunteer-application.entity';
import { VolunteerActivity, ActivityStatus } from './entities/volunteer-activity.entity';
import { VolunteerTrainingResource } from './entities/volunteer-training.entity';
import { VolunteerStat, VolunteerGrade } from './entities/volunteer-stat.entity';
import { User } from '../iam/entities/user.entity';
import { Connection, ConnectionStatus } from '../connections/entities/connection.entity';
import { AccountFlags } from '../iam/enums/roles.enum';
import {
    CreateVolunteerRoleDto,
    ApplyVolunteerDto,
    UpdateApplicationStatusDto,
    CreateActivityDto,
    UpdateActivityStatusDto,
    CreateTrainingResourceDto
} from './dto/volunteers.dto';
import { Op } from 'sequelize';

@Injectable()
export class VolunteersService {
    constructor(
        @InjectModel(VolunteerRole) private roleModel: typeof VolunteerRole,
        @InjectModel(VolunteerApplication) private applicationModel: typeof VolunteerApplication,
        @InjectModel(VolunteerActivity) private activityModel: typeof VolunteerActivity,
        @InjectModel(VolunteerTrainingResource) private trainingModel: typeof VolunteerTrainingResource,
        @InjectModel(VolunteerStat) private statModel: typeof VolunteerStat,
        @InjectModel(User) private userModel: typeof User,
        @InjectModel(Connection) private connectionRepo: typeof Connection,
    ) { }

    // ─── ROLES (Admin) ─────────────────────────────────────────────────────────

    async createRole(createdBy: string, dto: CreateVolunteerRoleDto) {
        return this.roleModel.create({
            ...dto,
            createdBy,
            openUntil: new Date(dto.openUntil)
        } as any);
    }

    async getActiveRoles(chapterId?: string) {
        const where: any = { isActive: true, openUntil: { [Op.gt]: new Date() } };
        if (chapterId) where.chapterId = chapterId;
        return this.roleModel.findAll({ where, include: ['chapter'] });
    }

    async closeRole(roleId: string) {
        const role = await this.roleModel.findByPk(roleId);
        if (!role) throw new NotFoundException('Role not found');
        role.isActive = false;
        await role.save();
        return { message: 'Role closed' };
    }

    // ─── APPLICATIONS ──────────────────────────────────────────────────────────

    async apply(userId: string, dto: ApplyVolunteerDto) {
        // Check if user already has a pending application for this role
        const existing = await this.applicationModel.findOne({
            where: { userId, roleId: dto.roleId || null, status: ApplicationStatus.PENDING }
        });
        if (existing) throw new BadRequestException('You already have a pending application.');

        return this.applicationModel.create({ ...dto, userId });
    }

    async getApplications(adminId: string, roleId?: string) {
        const where: any = {};
        if (roleId) where.roleId = roleId;
        return this.applicationModel.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'chapterId'] },
                { model: VolunteerRole }
            ]
        });
    }

    async updateApplicationStatus(adminId: string, applicationId: string, dto: UpdateApplicationStatusDto) {
        const app = await this.applicationModel.findByPk(applicationId, { include: [User] });
        if (!app) throw new NotFoundException('Application not found');

        app.status = dto.status;
        if (dto.interviewTime) app.interviewTime = new Date(dto.interviewTime);
        if (dto.adminNotes) app.adminNotes = dto.adminNotes;
        await app.save();

        if (dto.status === ApplicationStatus.APPROVED) {
            // Upgrade user to volunteer
            const user = await this.userModel.findByPk(app.userId);
            if (user) {
                if (!user.flags.includes(AccountFlags.VOLUNTEER)) {
                    user.flags = [...user.flags, AccountFlags.VOLUNTEER];
                    await user.save();
                }
                // Initialize stats
                await this.statModel.findOrCreate({ where: { userId: user.id } });

                // AUTOMATION: Create a connection between Admin and Volunteer to enable Direct Chat
                const existingConn = await this.connectionRepo.findOne({
                    where: {
                        [Op.or]: [
                            { requesterId: adminId, recipientId: user.id },
                            { requesterId: user.id, recipientId: adminId },
                        ]
                    }
                });

                if (!existingConn) {
                    await this.connectionRepo.create({
                        requesterId: adminId,
                        recipientId: user.id,
                        status: ConnectionStatus.ACCEPTED,
                        message: 'System-generated connection for volunteer coordination.'
                    });
                } else if (existingConn.status !== ConnectionStatus.ACCEPTED) {
                    existingConn.status = ConnectionStatus.ACCEPTED;
                    await existingConn.save();
                }
            }
        }

        return { message: `Application ${dto.status.toLowerCase()}`, status: app.status };
    }

    // ─── ACTIVITIES ────────────────────────────────────────────────────────────

    async createActivity(adminId: string, dto: CreateActivityDto) {
        return this.activityModel.create({
            ...dto,
            dueDate: new Date(dto.dueDate)
        } as any);
    }

    async getVolunteerActivities(volunteerId: string) {
        return this.activityModel.findAll({
            where: { assignedToId: volunteerId },
            order: [['dueDate', 'ASC']]
        });
    }

    async updateActivityStatus(volunteerId: string, activityId: string, dto: UpdateActivityStatusDto) {
        const activity = await this.activityModel.findOne({ where: { id: activityId, assignedToId: volunteerId } });
        if (!activity) throw new NotFoundException('Activity not found or not assigned to you');

        if (activity.status === ActivityStatus.COMPLETED) {
            throw new BadRequestException('Activity already completed');
        }

        activity.status = dto.status;
        if (dto.declineReason) activity.declineReason = dto.declineReason;
        await activity.save();

        if (dto.status === ActivityStatus.COMPLETED) {
            await this.awardPointsAndHours(volunteerId, activity.estimatedHours, activity.impactPoints);
        }

        return { message: `Activity marked as ${dto.status.toLowerCase()}` };
    }

    private async awardPointsAndHours(userId: string, hours: number, points: number) {
        const stats = await this.statModel.findOne({ where: { userId } });
        if (stats) {
            stats.totalHours = Number(stats.totalHours) + hours;
            stats.impactPoints += points;

            // Grade logic: Silver -> Bronze -> Gold
            if (stats.impactPoints >= 500) {
                stats.grade = VolunteerGrade.GOLD;
            } else if (stats.impactPoints >= 100) {
                stats.grade = VolunteerGrade.BRONZE;
            } else {
                stats.grade = VolunteerGrade.SILVER;
            }

            await stats.save();
        }
    }

    // ─── RESOURCES & ALERTS ────────────────────────────────────────────────────

    async createTrainingResource(adminId: string, dto: CreateTrainingResourceDto) {
        return this.trainingModel.create({ ...dto, createdBy: adminId });
    }

    async getTrainingResources() {
        return this.trainingModel.findAll({ order: [['createdAt', 'DESC']] });
    }
}
