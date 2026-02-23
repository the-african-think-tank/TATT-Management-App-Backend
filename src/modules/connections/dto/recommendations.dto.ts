import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecommendationsQueryDto {
    @ApiPropertyOptional({
        description: 'Maximum number of recommendations to return (1–50). Defaults to 20.',
        example: 20,
        minimum: 1,
        maximum: 50,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}

// ─── Response schema ──────────────────────────────────────────────────────────

export class RecommendedMemberSchema {
    @ApiProperty({ example: 'b2c9f1a0-4e8d-4f71-bf14-01e23f4a5678', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Jane' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'https://cdn.example.com/avatars/jane.jpg', nullable: true })
    profilePicture: string | null;

    @ApiProperty({ example: 'Senior Strategy Consultant', nullable: true })
    professionTitle: string | null;

    @ApiProperty({ example: 'AfriGrowth Capital', nullable: true })
    companyName: string | null;

    @ApiProperty({ example: 'Nairobi, Kenya', nullable: true })
    location: string | null;

    @ApiProperty({ example: 'TATT-NBO-0042' })
    tattMemberId: string;

    @ApiProperty({ example: 'UBUNTU', enum: ['FREE', 'UBUNTU', 'IMANI', 'KIONGOZI'] })
    communityTier: string;

    @ApiProperty({
        example: 'FinTech',
        nullable: true,
        description: 'Industry field from the candidate\'s profile',
    })
    industry: string | null;
}

export class ScoreBreakdownSchema {
    @ApiProperty({ example: 3, description: 'Number of interests shared with this member' })
    sharedInterestCount: number;

    @ApiProperty({
        example: ['Finance', 'Technology', 'Entrepreneurship'],
        description: 'Names of the shared interests',
        type: [String],
    })
    sharedInterestNames: string[];

    @ApiProperty({ example: true, description: 'Both members are in the same industry' })
    sameIndustry: boolean;

    @ApiProperty({ example: false, description: 'Both members belong to the same TATT chapter' })
    sameChapter: boolean;

    @ApiProperty({
        example: 125,
        description:
            'Composite relevance score. ' +
            'Formula: (sharedInterestCount × 25) + (sameIndustry ? 30 : 0) + (sameChapter ? 20 : 0)',
    })
    score: number;
}

export class RecommendationSchema {
    @ApiProperty({ type: () => RecommendedMemberSchema })
    member: RecommendedMemberSchema;

    @ApiProperty({ type: () => ScoreBreakdownSchema })
    matchReason: ScoreBreakdownSchema;

    @ApiProperty({
        example: true,
        description:
            'Whether the current user is allowed to send a connection request (paid members only). ' +
            'Free members can SEE recommendations but cannot initiate a request.',
    })
    canConnect: boolean;
}
