import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RegisterEventDto {
    @IsBoolean()
    @IsOptional()
    isBusinessRegistration?: boolean = false;

    @IsString()
    @IsOptional()
    paymentMethodId?: string;
}
