import { ApiProperty } from '@nestjs/swagger';

export class SubscriberSchema {
    @ApiProperty({ example: 'user-uuid-1', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Jane' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'jane.doe@example.com' })
    email: string;

    @ApiProperty({ example: 'UBUNTU', enum: ['UBUNTU', 'IMANI', 'KIONGOZI'] })
    communityTier: string;

    @ApiProperty({ example: '2026-03-22T12:00:00.000Z', format: 'date-time' })
    subscriptionExpiresAt: string;

    @ApiProperty({ example: 'MONTHLY', enum: ['MONTHLY', 'YEARLY'] })
    billingCycle: string;

    @ApiProperty({ example: true })
    hasAutoPayEnabled: boolean;

    @ApiProperty({ example: 'COMMUNITY_MEMBER' })
    systemRole: string;
}

export class RevenueMetricsSchema {
    @ApiProperty({ example: 42, description: 'Total number of active paid subscriptions.' })
    activeSubscriptions: number;

    @ApiProperty({ example: 1250.50, description: 'Calculated monthly revenue (normalised for annual plans).' })
    estimatedMonthlyRevenue: number;

    @ApiProperty({ example: 15006.00, description: 'Projected annual revenue based on current active subs.' })
    estimatedAnnualRunRate: number;

    @ApiProperty({ example: 'USD' })
    currency: string;
}

export class GenericMessageResponseSchema {
    @ApiProperty({ example: 'Operation completed successfully.' })
    message: string;
}
