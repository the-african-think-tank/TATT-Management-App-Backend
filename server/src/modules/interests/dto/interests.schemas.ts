import { ApiProperty } from '@nestjs/swagger';

export class InterestSchema {
    @ApiProperty({ example: 'int-uuid-1', format: 'uuid' })
    id: string;

    @ApiProperty({ example: 'FinTech' })
    name: string;

    @ApiProperty({ example: '2026-02-22T12:00:00.000Z' })
    createdAt: string;
}
