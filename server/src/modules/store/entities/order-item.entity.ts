import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo, Default,
} from 'sequelize-typescript';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Table({ tableName: 'order_items', timestamps: true })
export class OrderItem extends Model<OrderItem> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @ForeignKey(() => Order)
    @Column({ type: DataType.UUID, allowNull: false })
    orderId: string;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => Product)
    @Column({ type: DataType.UUID, allowNull: false })
    productId: string;

    @BelongsTo(() => Product)
    product: Product;

    @ForeignKey(() => ProductVariant)
    @Column({ type: DataType.UUID, allowNull: true })
    variantId?: string;

    @BelongsTo(() => ProductVariant)
    variant?: ProductVariant;

    @Default(1)
    @Column({ type: DataType.INTEGER })
    quantity: number;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    unitPrice: number;
}
