import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Partnership } from './entities/partnership.entity';
import { CreatePartnershipDto, UpdatePartnershipDto } from './dto/partnership.dto';
import { Op } from 'sequelize';

import { BroadcastsService } from '../notifications/services/broadcasts.service';
import { BroadcastAudience } from '../notifications/entities/broadcast.entity';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class PartnershipService {
    private readonly logger = new Logger(PartnershipService.name);

    constructor(
        @InjectModel(Partnership) private partnershipRepo: typeof Partnership,
        private broadcastsService: BroadcastsService,
    ) { }

    async create(dto: CreatePartnershipDto) {
        this.logger.log(`Creating new partnership: ${dto.name}`);
        const partnership = await this.partnershipRepo.create(dto as any);

        // Notify community about new partnership
        try {
            await this.broadcastsService.createSystemBroadcast({
                title: `New Strategic Partnership: ${dto.name}`,
                message: `We are excited to announce a new partnership with ${dto.name} (${dto.category}). Check out our marketplace for exclusive benefits!`,
                audienceType: BroadcastAudience.ALL,
                type: NotificationType.SYSTEM_ANNOUNCEMENT
            });
        } catch (error) {
            this.logger.error(`Failed to dispatch partnership broadcast: ${error.message}`);
        }

        return partnership;
    }

    async findAll(query: any) {
        const { search, category, status } = query;
        const where: any = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (category) {
            where.category = category;
        }

        if (status) {
            where.status = status;
        }

        return this.partnershipRepo.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });
    }

    async findOne(id: string) {
        const partnership = await this.partnershipRepo.findByPk(id);
        if (!partnership) throw new NotFoundException('Partnership not found');
        return partnership;
    }

    async update(id: string, dto: UpdatePartnershipDto) {
        const partnership = await this.findOne(id);
        return partnership.update(dto as any);
    }

    async remove(id: string) {
        const partnership = await this.findOne(id);
        await partnership.destroy();
        return { message: 'Partnership removed successfully' };
    }

    async getStats() {
        const total = await this.partnershipRepo.count();
        const active = await this.partnershipRepo.count({ where: { status: 'ACTIVE' } });
        
        // Count partners with KIONGOZI in tierAccess array (using JSON query in Sequelize)
        const kiongoziPartners = await this.partnershipRepo.findAll({
            where: {
                tierAccess: { [Op.contains]: ['KIONGOZI'] }
            }
        });

        // Sum quota amounts vs total used
        const stats = await this.partnershipRepo.findAll({
            attributes: [
                [this.partnershipRepo.sequelize.fn('SUM', this.partnershipRepo.sequelize.col('quotaAmount')), 'totalQuota'],
                [this.partnershipRepo.sequelize.fn('SUM', this.partnershipRepo.sequelize.col('quotaUsed')), 'totalUsed'],
            ],
            raw: true
        });

        return {
            totalCount: total,
            activeCount: active,
            kiongoziSupportCount: kiongoziPartners.length,
            quotaStats: stats[0]
        };
    }
}
