import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { VolunteerRole } from './entities/volunteer-role.entity';
import { VolunteerApplication, ApplicationStatus } from './entities/volunteer-application.entity';
import { VolunteerActivity, ActivityStatus } from './entities/volunteer-activity.entity';
import { VolunteerTrainingResource } from './entities/volunteer-training.entity';
import { VolunteerStat, VolunteerGrade, VolunteerStatus } from './entities/volunteer-stat.entity';
import { VolunteerTrainingProgress } from './entities/volunteer-training-progress.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
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
        @InjectModel(VolunteerTrainingProgress) private progressModel: typeof VolunteerTrainingProgress,
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

    async getMyApplications(userId: string) {
        return this.applicationModel.findAll({
            where: { userId },
            include: [{ model: VolunteerRole }],
            order: [['createdAt', 'DESC']],
        });
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

    async getTrainingStats() {
        const resources = await this.trainingModel.findAll({
            order: [['createdAt', 'DESC']]
        });

        const stats = await Promise.all(resources.map(async (resource) => {
            const completedCount = await this.progressModel.count({
                where: { resourceId: resource.id, isCompleted: true }
            });

            return {
                id: resource.id,
                title: resource.title,
                completions: completedCount,
                mediaCount: resource.mediaUrls.length
            };
        }));

        return stats;
    }

    async getStats(userId: string) {
        const [pendingActivities, neededRoles] = await Promise.all([
            this.activityModel.count({ where: { assignedToId: userId, status: ActivityStatus.ASSIGNED } }),
            this.roleModel.count({ where: { isActive: true, openUntil: { [Op.gt]: new Date() } } })
        ]);
        return { pendingActivities, neededRoles };
    }

    // ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────

    async getAdminDashboardStats() {
        const [totalVolunteers, pendingApplications, onboardingVolunteers, trainingCompletion] = await Promise.all([
            this.userModel.count({ where: { flags: { [Op.contains]: [AccountFlags.VOLUNTEER] } } }),
            this.applicationModel.count({ where: { status: ApplicationStatus.PENDING } }),
            this.statModel.count({ where: { status: VolunteerStatus.TRAINING } }),
            this.calculateTrainingCompletionRate()
        ]);

        return {
            totalVolunteers,
            pendingApplications,
            onboardingVolunteers,
            trainingCompletionRate: trainingCompletion
        };
    }

    async getAdminVolunteersList(query: { page?: number; limit?: number; search?: string; chapterId?: string; status?: string }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;

        const where: any = { flags: { [Op.contains]: [AccountFlags.VOLUNTEER] } };
        const statWhere: any = {};
        
        if (query.search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${query.search}%` } },
                { lastName: { [Op.iLike]: `%${query.search}%` } },
                { email: { [Op.iLike]: `%${query.search}%` } },
            ];
        }
        if (query.chapterId) where.chapterId = query.chapterId;
        if (query.status) statWhere.status = query.status;

        const { rows, count } = await this.userModel.findAndCountAll({
            where,
            include: [
                { 
                    model: VolunteerStat,
                    where: Object.keys(statWhere).length > 0 ? statWhere : undefined,
                    required: Object.keys(statWhere).length > 0
                },
                { model: Chapter },
                { model: VolunteerApplication, as: 'applications', limit: 1, order: [['createdAt', 'DESC']] }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    async getAdminApplicationsList(query: { page?: number; limit?: number; search?: string; status?: string }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (query.status) where.status = query.status;
        
        const userWhere: any = {};
        if (query.search) {
            userWhere[Op.or] = [
                { firstName: { [Op.iLike]: `%${query.search}%` } },
                { lastName: { [Op.iLike]: `%${query.search}%` } },
                { email: { [Op.iLike]: `%${query.search}%` } },
            ];
        }

        const { rows, count } = await this.applicationModel.findAndCountAll({
            where,
            include: [
                { 
                    model: User, 
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
                    required: Object.keys(userWhere).length > 0
                },
                { model: VolunteerRole, as: 'role' }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    private async calculateTrainingCompletionRate() {
        const totalVolunteers = await this.userModel.count({ where: { flags: { [Op.contains]: [AccountFlags.VOLUNTEER] } } });
        if (totalVolunteers === 0) return 0;

        const totalResources = await this.trainingModel.count();
        if (totalResources === 0) return 100;

        const completedRecords = await this.progressModel.count({ where: { isCompleted: true } });
        
        // This is a simplified average: (Total completions) / (Total possible completions)
        const rate = (completedRecords / (totalVolunteers * totalResources)) * 100;
        return Math.round(rate);
    }
}
