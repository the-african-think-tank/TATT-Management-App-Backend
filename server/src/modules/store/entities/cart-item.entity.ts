import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo, Default,
} from 'sequelize-typescript';
import { Cart } from './cart.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Table({ tableName: 'cart_items', timestamps: true })
export class CartItem extends Model<CartItem> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @ForeignKey(() => Cart)
    @Column({ type: DataType.UUID, allowNull: false })
    cartId: string;

    @BelongsTo(() => Cart)
    cart: Cart;

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
    @Column({ type: DataType.INTEGER, allowNull: false })
    quantity: number;
}
