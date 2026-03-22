import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col, literal } from 'sequelize';
import { FinancialTransaction, TransactionStatus, TransactionType } from './entities/financial-transaction.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { CommunityTier } from '../iam/enums/roles.enum';

@Injectable()
export class RevenueService {
    private readonly logger = new Logger(RevenueService.name);

    constructor(
        @InjectModel(FinancialTransaction) private transactionRepo: typeof FinancialTransaction,
        @InjectModel(User) private userRepo: typeof User,
        @InjectModel(Chapter) private chapterRepo: typeof Chapter,
    ) {}

    async getMetadata() {
        const [chapters] = await Promise.all([
            this.chapterRepo.findAll({
                attributes: ['id', 'name', 'code'],
                order: [['name', 'ASC']]
            }),
        ]);

        const tiers = Object.values(CommunityTier).filter(t => t !== 'FREE');

        return {
            chapters,
            tiers: tiers.map(t => ({ id: t, name: t.charAt(0) + t.slice(1).toLowerCase() }))
        };
    }

    async getStats(filters: { chapterId?: string; tier?: string; startDate?: Date; endDate?: Date }) {
        const where: any = { status: TransactionStatus.COMPLETED };
        
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt[Op.gte] = filters.startDate;
            if (filters.endDate) where.createdAt[Op.lte] = filters.endDate;
        }

        if (filters.chapterId) where.chapterId = filters.chapterId;
        if (filters.tier) where.membershipTier = filters.tier;

        const transactions = await this.transactionRepo.findAll({
            where,
            attributes: ['type', 'amount', 'chapterId', 'membershipTier', 'createdAt'],
        });

        const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const subRevenue = transactions.filter(tx => tx.type === TransactionType.SUBSCRIPTION).reduce((sum, tx) => sum + Number(tx.amount), 0);
        const productRevenue = transactions.filter(tx => tx.type === TransactionType.PRODUCT_SALE).reduce((sum, tx) => sum + Number(tx.amount), 0);

        // Calculate growth (mocking for now by comparing to prev 30 days if no date filters provided)
        // In a real scenario, we'd fetch two datasets.
        const growth = 12.5; // Placeholder for logic

        return {
            totalRevenue,
            subRevenue,
            productRevenue,
            growth,
            transactionCount: transactions.length,
        };
    }

    async getTrends(filters: { chapterId?: string; months?: number }) {
        const months = filters.months || 6;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const where: any = { status: TransactionStatus.COMPLETED, createdAt: { [Op.gte]: startDate } };
        if (filters.chapterId) where.chapterId = filters.chapterId;

        const history = await this.transactionRepo.findAll({
            where,
            attributes: [
                [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
                [fn('SUM', col('amount')), 'total'],
            ],
            group: [literal('month') as any],
            order: [[literal('month'), 'ASC']],
            raw: true,
        });

        return history.map((h: any) => ({
            month: new Date(h.month).toLocaleString('default', { month: 'short' }),
            revenue: Number(h.total)
        }));
    }

    async getTransactions(params: { page: number; limit: number; search?: string; type?: string; status?: string; chapterId?: string }) {
        const { page = 1, limit = 20, search, type, status, chapterId } = params;
        const where: any = {};
        
        if (type) where.type = type;
        if (status) where.status = status;
        if (chapterId) where.chapterId = chapterId;

        const { rows, count } = await this.transactionRepo.findAndCountAll({
            where,
            include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'profilePicture'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });

        return {
            data: rows,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async getByChapter() {
        return this.transactionRepo.findAll({
            where: { status: TransactionStatus.COMPLETED },
            attributes: [
                'chapterId',
                [fn('SUM', col('amount')), 'total'],
            ],
            include: [{ model: Chapter, attributes: ['name', 'code'] }],
            group: ['chapterId', 'chapter.id'],
            order: [[literal('total'), 'DESC']],
        });
    }

    async logTransaction(data: Partial<FinancialTransaction>) {
        return this.transactionRepo.create(data as any);
    }
}
