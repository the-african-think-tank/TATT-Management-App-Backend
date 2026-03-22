import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, Default,
} from 'sequelize-typescript';
import { Product } from './product.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../../iam/entities/user.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

@Table({ tableName: 'orders', timestamps: true, paranoid: true })
export class Order extends Model<Order> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    orderNumber: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    customerId?: string;

    @BelongsTo(() => User, 'customerId')
    customer?: User;

    // For guest / external orders
    @Column({ type: DataType.STRING, allowNull: true })
    customerName?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    customerEmail?: string;

    @Default(OrderStatus.PENDING)
    @Column({ type: DataType.ENUM(...Object.values(OrderStatus)) })
    status: OrderStatus;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    totalAmount: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    shippingAddress?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    trackingNumber?: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    notes?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    stripeCheckoutSessionId?: string;

    @ForeignKey(() => Product)
    @Column({ type: DataType.UUID, allowNull: true })
    productId?: string;

    @HasMany(() => OrderItem)
    items: OrderItem[];
}
