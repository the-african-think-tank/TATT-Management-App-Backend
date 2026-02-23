import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../iam/entities/user.entity';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { ProfessionalInterest } from '../interests/entities/interest.entity';
import { UserInterest } from '../interests/entities/user-interest.entity';
import { CommunityTier } from '../iam/enums/roles.enum';
import { RecommendationSchema } from './dto/recommendations.dto';

// ─── Scoring weights ──────────────────────────────────────────────────────────
/** Points awarded per shared professional interest */
const INTEREST_MATCH_WEIGHT = 25;
/** Bonus when both members share the same industry field */
const INDUSTRY_BONUS = 30;
/** Bonus when both members belong to the same TATT chapter */
const CHAPTER_BONUS = 20;

/** Paid tiers that can initiate connection requests */
const PAID_TIERS: CommunityTier[] = [
    CommunityTier.UBUNTU,
    CommunityTier.IMANI,
    CommunityTier.KIONGOZI,
];

/** Profile attributes returned for each recommended member */
const MEMBER_PROFILE_ATTRS = [
    'id', 'firstName', 'lastName', 'profilePicture',
    'professionTitle', 'companyName', 'location',
    'tattMemberId', 'communityTier', 'industry', 'chapterId',
] as const;

@Injectable()
export class RecommenderService {
    private readonly logger = new Logger(RecommenderService.name);

    constructor(
        @InjectModel(User) private userRepo: typeof User,
        @InjectModel(Connection) private connectionRepo: typeof Connection,
    ) { }

    /**
     * Core TATT Connect Recommender.
     *
     * Scoring algorithm:
     *   score = (sharedInterestCount × 25) + (sameIndustry ? 30 : 0) + (sameChapter ? 20 : 0)
     *
     * At minimum a candidate must share at least ONE interest to be included in results.
     * Results are sorted descending by score and capped at `limit`.
     */
    async getRecommendations(currentUser: User, limit: number = 20): Promise<RecommendationSchema[]> {
        // ── 1. Load current user's full profile (interests + industry + chapter) ────
        const me = await this.userRepo.findByPk(currentUser.id, {
            attributes: [...MEMBER_PROFILE_ATTRS],
            include: [
                {
                    model: ProfessionalInterest,
                    as: 'interests',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }, // omit junction row from output
                },
            ],
        });

        const myInterestIds = new Set<string>((me.interests ?? []).map((i) => i.id));
        const myInterestNames = new Map<string, string>(
            (me.interests ?? []).map((i) => [i.id, i.name]),
        );

        // ── 2. Find all non-pending/accepted connections (build exclusion set) ────
        const existingConnections = await this.connectionRepo.findAll({
            where: {
                [Op.or]: [
                    { requesterId: currentUser.id },
                    { recipientId: currentUser.id },
                ],
                status: {
                    // Exclude active connections and pending requests.
                    // Declined/Withdrawn are allowed back into recommendations.
                    [Op.in]: [ConnectionStatus.ACCEPTED, ConnectionStatus.PENDING],
                },
            },
            attributes: ['requesterId', 'recipientId'],
        });

        const excludedIds = new Set<string>([currentUser.id]);
        for (const conn of existingConnections) {
            excludedIds.add(conn.requesterId);
            excludedIds.add(conn.recipientId);
        }

        // ── 3. Load all active, eligible candidates with their interests ──────────
        const candidates = await this.userRepo.findAll({
            where: {
                id: { [Op.notIn]: [...excludedIds] },
                isActive: true,
            },
            attributes: [...MEMBER_PROFILE_ATTRS],
            include: [
                {
                    model: ProfessionalInterest,
                    as: 'interests',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                },
            ],
        });

        if (myInterestIds.size === 0) {
            // Current user has no interests — nothing to base recommendations on.
            // Return empty rather than recommending everyone (noise).
            this.logger.log(
                `TATT Recommender: user ${currentUser.id} has no interests set — returning empty recommendations.`,
            );
            return [];
        }

        // ── 4. Score each candidate ────────────────────────────────────────────────
        const scored: Array<RecommendationSchema & { _score: number }> = [];

        for (const candidate of candidates) {
            const candidateInterestIds = (candidate.interests ?? []).map((i) => i.id);

            // Compute shared interests
            const sharedIds = candidateInterestIds.filter((id) => myInterestIds.has(id));

            // Must share at least one interest to appear in recommendations
            if (sharedIds.length === 0) continue;

            const sameIndustry =
                !!me.industry &&
                !!candidate.industry &&
                me.industry.trim().toLowerCase() === candidate.industry.trim().toLowerCase();

            const sameChapter =
                !!me.chapterId &&
                !!candidate.chapterId &&
                me.chapterId === candidate.chapterId;

            const score =
                sharedIds.length * INTEREST_MATCH_WEIGHT +
                (sameIndustry ? INDUSTRY_BONUS : 0) +
                (sameChapter ? CHAPTER_BONUS : 0);

            const sharedInterestNames = sharedIds
                .map((id) => myInterestNames.get(id))
                .filter(Boolean);

            scored.push({
                _score: score,
                member: {
                    id: candidate.id,
                    firstName: candidate.firstName,
                    lastName: candidate.lastName,
                    profilePicture: candidate.profilePicture ?? null,
                    professionTitle: candidate.professionTitle ?? null,
                    companyName: candidate.companyName ?? null,
                    location: candidate.location ?? null,
                    tattMemberId: candidate.tattMemberId,
                    communityTier: candidate.communityTier,
                    industry: candidate.industry ?? null,
                },
                matchReason: {
                    sharedInterestCount: sharedIds.length,
                    sharedInterestNames,
                    sameIndustry,
                    sameChapter,
                    score,
                },
                canConnect: PAID_TIERS.includes(currentUser.communityTier),
            });
        }

        // ── 5. Sort descending by score, apply limit ───────────────────────────────
        scored.sort((a, b) => b._score - a._score);
        const results = scored.slice(0, limit);

        // Strip internal _score before returning
        return results.map(({ _score: _dropped, ...rest }) => rest);
    }
}
