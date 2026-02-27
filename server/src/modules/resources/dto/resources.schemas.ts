import { ApiProperty } from '@nestjs/swagger';
import { ResourceType, ResourceVisibility } from '../entities/resource.entity';
import { CommunityTier } from '../../iam/enums/roles.enum';

export class ResourceCardSchema {
    @ApiProperty({ example: 'resource-uuid', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'Legal Guide: Contracts 101' })
    title: string;

    @ApiProperty({ enum: ResourceType })
    type: ResourceType;

    @ApiProperty({ example: '<p>Essential contract clauses for startups.</p>', nullable: true })
    description: string | null;

    @ApiProperty({ example: 'https://example.com/thumb.jpg', nullable: true })
    thumbnailUrl: string | null;

    @ApiProperty({ example: 'chap-uuid', format: 'uuid', nullable: true })
    chapterId: string | null;

    @ApiProperty({ enum: ResourceVisibility })
    visibility: ResourceVisibility;

    @ApiProperty({ enum: CommunityTier })
    minTier: CommunityTier;

    @ApiProperty({ type: [String], example: ['Legal', 'Tech'] })
    tags: string[];

    @ApiProperty({ example: '2026-02-23T12:00:00.000Z' })
    createdAt: string;
}

export class ResourceDetailSchema extends ResourceCardSchema {
    @ApiProperty({ example: 'https://example.com/guide', nullable: true, description: 'Only present when access rules are met' })
    contentUrl: string | null;

    @ApiProperty({ description: 'Type-specific data', nullable: true })
    metadata: Record<string, unknown> | null;
}

export class ResourcesListMetaSchema {
    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}

export class ResourcesListResponseSchema {
    @ApiProperty({ type: [ResourceCardSchema] })
    data: ResourceCardSchema[];

    @ApiProperty({ type: ResourcesListMetaSchema })
    meta: ResourcesListMetaSchema;
}

export class ResourceDetailResponseSchema {
    @ApiProperty({ type: ResourceDetailSchema })
    data: ResourceDetailSchema;
}

export class CreateResourceResponseSchema {
    @ApiProperty({ type: ResourceDetailSchema })
    data: ResourceDetailSchema;

    @ApiProperty({ example: 'Resource created successfully' })
    message: string;
}

export class UpdateResourceResponseSchema {
    @ApiProperty({ type: ResourceDetailSchema })
    data: ResourceDetailSchema;

    @ApiProperty({ example: 'Resource updated successfully' })
    message: string;
}

export class DeleteResourceResponseSchema {
    @ApiProperty({ example: 'Resource archived successfully' })
    message: string;
}
