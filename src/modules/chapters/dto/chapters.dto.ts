import { IsString, IsNotEmpty, IsArray, IsOptional, Length } from 'class-validator';

export class CreateChapterDto {
    @IsString()
    @IsNotEmpty()
    @Length(4, 4, { message: 'Chapter code must be exactly 4 characters.' })
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsString({ each: true })
    cities: string[];

    @IsString()
    @IsOptional()
    regionalManagerId?: string;
}
