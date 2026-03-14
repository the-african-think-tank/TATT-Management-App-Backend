import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, Default,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Table({ tableName: 'carts', timestamps: true })
export class Cart extends Model<Cart> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    userId?: string;

    @BelongsTo(() => User)
    user?: User;

    @Column({ type: DataType.STRING, allowNull: true })
    sessionId?: string; // For guest users

    @HasMany(() => CartItem)
    items: CartItem[];
}
