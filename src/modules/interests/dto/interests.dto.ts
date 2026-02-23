import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterestDto {
    @ApiProperty({ description: 'Name of the professional interest or skill', example: 'FinTech' })
    @IsString()
    @IsNotEmpty()
    name: string;
}
