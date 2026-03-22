import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { User } from '../iam/entities/user.entity';
import { Post } from '../feed/entities/post.entity';
import { Connection } from '../connections/entities/connection.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { ResourceInteraction } from '../resources/entities/resource-interaction.entity';
import { SystemRole, CommunityTier } from '../iam/enums/roles.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Post) private readonly postModel: typeof Post,
    @InjectModel(Connection) private readonly connectionModel: typeof Connection,
    @InjectModel(Chapter) private readonly chapterModel: typeof Chapter,
    @InjectModel(ResourceInteraction) private readonly interactionModel: typeof ResourceInteraction,
  ) {}

  async getPlatformGrowth() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // 1. Core KPIs with Trend Calculation
    const totalMembers = await this.userModel.count({ where: { systemRole: SystemRole.COMMUNITY_MEMBER } });
    const membersLast30 = await this.userModel.count({ 
        where: { 
            systemRole: SystemRole.COMMUNITY_MEMBER,
            createdAt: { [Op.gte]: thirtyDaysAgo } 
        } 
    });
    const membersPrev30 = await this.userModel.count({ 
        where: { 
            systemRole: SystemRole.COMMUNITY_MEMBER,
            createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] } 
        } 
    });

    const activeUserCount = await this.interactionModel.count({
        distinct: true,
        col: 'userId',
        where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });
    const prevActiveUserCount = await this.interactionModel.count({
        distinct: true,
        col: 'userId',
        where: { createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] } }
    });

    const totalConnections = await this.connectionModel.count();
    const connectionsLast30 = await this.connectionModel.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });
    const connectionsPrev30 = await this.connectionModel.count({ where: { createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] } } });

    const totalTraffic = await this.interactionModel.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });
    const prevTraffic = await this.interactionModel.count({ where: { createdAt: { [Op.between]: [sixtyDaysAgo, thirtyDaysAgo] } } });

    // Helper for percentage change
    const getChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const diff = ((current - previous) / previous) * 100;
        return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    // 2. Growth Trends (Daily)
    const signupTrends = await this.userModel.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
    });

    const interactionTrends = await this.interactionModel.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
    });

    // 3. Subscription Dynamics
    const ubuntuCount = await this.userModel.count({ where: { communityTier: CommunityTier.UBUNTU } });
    const imaniCount = await this.userModel.count({ where: { communityTier: CommunityTier.IMANI } });
    const kiongoziCount = await this.userModel.count({ where: { communityTier: CommunityTier.KIONGOZI } });
    const totalSubs = ubuntuCount + imaniCount + kiongoziCount;
    const prevSubs = await this.userModel.count({ 
        where: { 
            communityTier: { [Op.ne]: CommunityTier.FREE },
            createdAt: { [Op.lt]: thirtyDaysAgo } 
        } 
    });

    // Tier Migration calc (simplistic proportion of power users in 30d)
    const migrationUbuntuImani = totalMembers > 0 ? ((imaniCount / totalMembers) * 100).toFixed(1) : '0';
    const migrationImaniKiongozi = imaniCount > 0 ? ((kiongoziCount / imaniCount) * 100).toFixed(1) : '0';

    // 4. Chapter Performance (Dynamic)
    const chapters = await this.chapterModel.findAll({
      include: [{ model: User, as: 'members', attributes: ['id', 'createdAt'] }],
      limit: 5
    });
    
    const chapterStats = chapters.map((c: any) => {
      const total = c.members?.length || 0;
      const recent = c.members?.filter((m: any) => new Date(m.createdAt) >= thirtyDaysAgo).length || 0;
      const growthRate = total > 0 ? ((recent / total) * 100).toFixed(1) : '0';
      
      return {
        name: c.name,
        members: total,
        growth: `+${growthRate}%`,
        status: parseFloat(growthRate) > 15 ? 'EXCELLING' : 'STABLE'
      };
    });

    // Trends labels formatting
    const labels = [];
    const signupData = [];
    const hitData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        labels.push(ds);
        signupData.push(signupTrends.find((t: any) => t.get('date') === ds)?.get('count') || 0);
        hitData.push(interactionTrends.find((t: any) => t.get('date') === ds)?.get('count') || 0);
    }

    return {
      kpis: {
        totalTraffic: { 
            value: totalTraffic, 
            change: getChange(totalTraffic, prevTraffic), 
            isPositive: totalTraffic >= prevTraffic 
        }, 
        engagement: { 
            value: `${(totalMembers > 0 ? (activeUserCount / totalMembers) * 100 : 0).toFixed(1)}%`, 
            change: getChange(activeUserCount, prevActiveUserCount), 
            isPositive: activeUserCount >= prevActiveUserCount 
        },
        newConnections: { 
            value: totalConnections, 
            change: getChange(connectionsLast30, connectionsPrev30), 
            isPositive: connectionsLast30 >= connectionsPrev30 
        },
        totalSubscriptions: { 
            value: totalSubs, 
            change: getChange(totalSubs, prevSubs), 
            isPositive: totalSubs >= prevSubs 
        },
      },
      trends: {
        labels,
        signups: signupData,
        posts: hitData,
      },
      subscriptions: {
        ubuntuToImani: imaniCount,
        imaniToKiongozi: kiongoziCount,
        migrationVelocity: migrationUbuntuImani,
        retentionVelocity: migrationImaniKiongozi
      },
      chapters: chapterStats
    };
  }
}
