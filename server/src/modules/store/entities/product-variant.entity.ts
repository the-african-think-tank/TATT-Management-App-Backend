import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo, Default,
} from 'sequelize-typescript';
import { Product } from './product.entity';

@Table({ tableName: 'product_variants', timestamps: true, paranoid: true })
export class ProductVariant extends Model<ProductVariant> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @ForeignKey(() => Product)
    @Column({ type: DataType.UUID, allowNull: false })
    productId: string;

    @BelongsTo(() => Product)
    product: Product;

    // e.g. "S", "M", "L", "XL", "Black", "White"
    @Column({ type: DataType.STRING, allowNull: false })
    label: string;

    // e.g. "SIZE", "COLOR"
    @Column({ type: DataType.STRING, allowNull: false })
    type: string;

    @Column({ type: DataType.STRING, allowNull: true })
    sku?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    size?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    color?: string;

    @Default(0)
    @Column({ type: DataType.INTEGER })
    stock: number;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
    priceAdjustment?: number;
}
