import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { JobListing } from './entities/job-listing.entity';
import { JobApplication } from './entities/job-application.entity';
import { SavedJob } from './entities/saved-job.entity';
import { User } from '../iam/entities/user.entity';
import { ApplyJobDto } from './dto/jobs.dto';

export type MarketInsights = {
    topCategory: { name: string; growth: string } | null;
    salaryTrend: { avg: number; label: string };
    topEmployers: { name: string; initials: string }[];
};

@Injectable()
export class JobsService {
    constructor(
        @InjectModel(JobListing) private jobRepo: typeof JobListing,
        @InjectModel(JobApplication) private applicationRepo: typeof JobApplication,
        @InjectModel(SavedJob) private savedRepo: typeof SavedJob,
        @InjectModel(User) private userRepo: typeof User,
    ) {}

    async getListings(params: { category?: string; type?: string; location?: string; search?: string; page?: number; limit?: number }) {
        const { category, type, location, search, page = 1, limit = 10 } = params;
        const where: WhereOptions<JobListing> = { isActive: true };

        if (category && category !== 'all') where.category = { [Op.iLike]: `%${category}%` };
        if (type && type !== 'all') where.type = { [Op.iLike]: `%${type}%` };
        if (location && location !== 'all') {
            if (location.toLowerCase() === 'remote') where.location = { [Op.iLike]: '%remote%' };
            else where.location = { [Op.iLike]: `%${location}%` };
        }
        if (search?.trim()) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search.trim()}%` } },
                { companyName: { [Op.iLike]: `%${search.trim()}%` } },
                { description: { [Op.iLike]: `%${search.trim()}%` } },
            ];
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await this.jobRepo.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
        return { data: rows, meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) || 0 } };
    }

    async getListingById(id: string) {
        const job = await this.jobRepo.findByPk(id);
        if (!job) throw new NotFoundException('Job not found');
        return job;
    }

    async apply(userId: string, jobId: string, dto: ApplyJobDto) {
        const job = await this.getListingById(jobId);
        const existing = await this.applicationRepo.findOne({ where: { userId, jobId } });
        if (existing) throw new BadRequestException('You have already applied to this job.');
        const application = await this.applicationRepo.create({
            userId,
            jobId,
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            resumeUrl: dto.resumeUrl,
            coverLetter: dto.coverLetter,
        });
        return { message: 'Application submitted.', application };
    }

    async getSavedJobIds(userId: string): Promise<string[]> {
        const saved = await this.savedRepo.findAll({ where: { userId }, attributes: ['jobId'] });
        return saved.map((s) => s.jobId);
    }

    async toggleSaved(userId: string, jobId: string) {
        await this.getListingById(jobId);
        const existing = await this.savedRepo.findOne({ where: { userId, jobId } });
        if (existing) {
            await existing.destroy();
            return { saved: false, message: 'Removed from saved roles.' };
        }
        await this.savedRepo.create({ userId, jobId });
        return { saved: true, message: 'Added to saved roles.' };
    }

    async getSavedListings(userId: string) {
        const saved = await this.savedRepo.findAll({
            where: { userId },
            include: [{ model: JobListing, as: 'job' }],
        });
        return saved.map((s) => (s as any).job).filter(Boolean);
    }

    async getMarketInsights(): Promise<MarketInsights> {
        const jobs = await this.jobRepo.findAll({
            where: { isActive: true },
            attributes: ['category', 'companyName', 'salaryMin', 'salaryMax'],
            raw: true,
        });
        const categoryCounts: Record<string, number> = {};
        const employerSet = new Set<string>();
        let salarySum = 0;
        let salaryCount = 0;
        jobs.forEach((r: any) => {
            const c = r.category || 'Other';
            categoryCounts[c] = (categoryCounts[c] || 0) + 1;
            if (r.companyName) employerSet.add(r.companyName);
            if (r.salaryMin != null && r.salaryMax != null) {
                salarySum += (Number(r.salaryMin) + Number(r.salaryMax)) / 2;
                salaryCount++;
            }
        });
        const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
        const topEmployers = Array.from(employerSet).slice(0, 5).map((name) => ({ name, initials: name.slice(0, 2).toUpperCase() }));
        return {
            topCategory: topCategoryEntry ? { name: topCategoryEntry[0], growth: '+18% growth this month' } : { name: 'Green Tech', growth: '+18% growth this month' },
            salaryTrend: { avg: salaryCount > 0 ? Math.round(salarySum / salaryCount) : 95000, label: 'Executive roles in West Africa' },
            topEmployers: topEmployers.length > 0 ? topEmployers : [{ name: 'EcoTech', initials: 'ET' }, { name: 'Nile Fintech', initials: 'NF' }, { name: 'SolarPath', initials: 'SP' }],
        };
    }
}
