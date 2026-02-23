import { ApiProperty } from '@nestjs/swagger';

export class ChapterSchema {
    @ApiProperty({ example: 'chap-uuid-1', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'NBO-1' })
    code: string;

    @ApiProperty({ example: 'Nairobi Chapter' })
    name: string;

    @ApiProperty({ example: 'Serving the greater Nairobi metropolitan area.' })
    description: string;

    @ApiProperty({ type: [String], example: ['Nairobi', 'Kiambu', 'Machakos'] })
    cities: string[];

    @ApiProperty({ example: 'user-uuid-manager', format: 'uuid', nullable: true })
    regionalManagerId: string | null;

    @ApiProperty({ example: '2026-02-22T12:00:00.000Z' })
    createdAt: string;
}

export class ChapterResponseSchema {
    @ApiProperty({ type: [ChapterSchema] })
    data: ChapterSchema[];
}
