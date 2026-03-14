import {
    IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsInt, Min, IsArray, IsBoolean, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory, ProductStatus } from '../entities/product.entity';
import { OrderStatus } from '../entities/order.entity';

export class CreateVariantDto {
    @ApiProperty() @IsString() @IsNotEmpty() label: string;
    @ApiProperty({ example: 'SIZE | COLOR' }) @IsString() @IsNotEmpty() type: string;
    @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() size?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
    @ApiProperty() @IsInt() @Min(0) @Type(() => Number) stock: number;
    @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) priceAdjustment?: number;
}

export class CreateProductDto {
    @ApiProperty() @IsString() @IsNotEmpty() name: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiProperty({ enum: ProductCategory }) @IsEnum(ProductCategory) category: ProductCategory;
    @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
    @ApiProperty() @IsNumber() @Min(0) @Type(() => Number) price: number;
    @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
    @ApiProperty() @IsInt() @Min(0) @Type(() => Number) stock: number;
    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Type(() => Number) lowStockThreshold?: number;
    @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsArray() additionalImages?: string[];
    @ApiPropertyOptional({ enum: ProductStatus }) @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
    @ApiPropertyOptional() @IsOptional() @IsBoolean() isLimitedEdition?: boolean;
    @ApiPropertyOptional() @IsOptional() @IsDateString() dropStart?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() dropEnd?: string;
    @ApiPropertyOptional({ type: [CreateVariantDto] }) @IsOptional() @IsArray() variants?: CreateVariantDto[];
}

export class UpdateProductDto {
    @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiPropertyOptional({ enum: ProductCategory }) @IsOptional() @IsEnum(ProductCategory) category?: ProductCategory;
    @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
    @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) price?: number;
    @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) stock?: number;
    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Type(() => Number) lowStockThreshold?: number;
    @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsArray() additionalImages?: string[];
    @ApiPropertyOptional({ enum: ProductStatus }) @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
    @ApiPropertyOptional() @IsOptional() @IsBoolean() isLimitedEdition?: boolean;
    @ApiPropertyOptional() @IsOptional() @IsDateString() dropStart?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() dropEnd?: string;
}

export class AdjustStockDto {
    @ApiProperty({ description: 'Positive to add stock, negative to reduce' })
    @IsInt() @Type(() => Number)
    adjustment: number;
}

// CreateVariantDto was moved up to be used by CreateProductDto

export class CreateOrderDto {
    @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() customerName?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() customerEmail?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() shippingAddress?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                productId: { type: 'string' },
                variantId: { type: 'string' },
                quantity: { type: 'number' },
            },
        },
    })
    @IsArray()
    items: { productId: string; variantId?: string; quantity: number }[];
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus }) @IsEnum(OrderStatus) status: OrderStatus;
    @ApiPropertyOptional() @IsOptional() @IsString() trackingNumber?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class AddToCartDto {
    @ApiProperty() @IsString() @IsNotEmpty() productId: string;
    @ApiPropertyOptional() @IsOptional() @IsString() variantId?: string;
    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Type(() => Number) quantity?: number;
    @ApiPropertyOptional() @IsOptional() @IsString() sessionId?: string;
}

export class UpdateCartItemDto {
    @ApiProperty() @IsInt() @Min(1) @Type(() => Number) quantity: number;
}
