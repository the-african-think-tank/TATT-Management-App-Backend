import { IsBoolean, IsOptional } from 'class-validator';

export class RegisterEventDto {
    @IsBoolean()
    @IsOptional()
    isBusinessRegistration?: boolean = false;
}
