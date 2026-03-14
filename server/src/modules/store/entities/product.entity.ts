import {
    Table, Column, Model, DataType, HasMany, Default,
} from 'sequelize-typescript';
import { ProductVariant } from './product-variant.entity';
import { Order } from './order.entity';

export enum ProductCategory {
    APPAREL = 'APPAREL',
    ACCESSORIES = 'ACCESSORIES',
    HOME_DECOR = 'HOME_DECOR',
    LIMITED_DROPS = 'LIMITED_DROPS',
    BOOKS = 'BOOKS',
    DIGITAL = 'DIGITAL',
    OTHER = 'OTHER',
}

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    DRAFT = 'DRAFT',
    ARCHIVED = 'ARCHIVED',
}

@Table({ tableName: 'products', timestamps: true, paranoid: true })
export class Product extends Model<Product> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    description?: string;

    @Column({ type: DataType.ENUM(...Object.values(ProductCategory)), allowNull: false, defaultValue: ProductCategory.APPAREL })
    category: ProductCategory;

    @Column({ type: DataType.STRING, allowNull: true })
    brand?: string;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    price: number;

    @Default('USD')
    @Column({ type: DataType.STRING(3) })
    currency: string;

    @Default(0)
    @Column({ type: DataType.INTEGER })
    stock: number;

    @Default(5)
    @Column({ type: DataType.INTEGER })
    lowStockThreshold: number;

    @Column({ type: DataType.STRING, allowNull: true })
    imageUrl?: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
    additionalImages?: string[];

    @Default(ProductStatus.ACTIVE)
    @Column({ type: DataType.ENUM(...Object.values(ProductStatus)) })
    status: ProductStatus;

    @Default(0)
    @Column({ type: DataType.INTEGER })
    totalSold: number;

    @Default(false)
    @Column({ type: DataType.BOOLEAN })
    isLimitedEdition: boolean;

    @Column({ type: DataType.DATE })
    dropStart?: Date;

    @Column({ type: DataType.DATE })
    dropEnd?: Date;

    @HasMany(() => ProductVariant)
    variants: ProductVariant[];

    @HasMany(() => Order)
    orders: Order[];
}
