import {
    Table, Column, Model, DataType, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

export enum TransactionType {
    SUBSCRIPTION = 'SUBSCRIPTION',
    PRODUCT_SALE = 'PRODUCT_SALE',
    EVENT_TICKET = 'EVENT_TICKET',
    DONATION = 'DONATION'
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

@Table({ tableName: 'financial_transactions', timestamps: true })
export class FinancialTransaction extends Model<FinancialTransaction> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: true })
    userId?: string;

    @BelongsTo(() => User)
    user?: User;

    @ForeignKey(() => Chapter)
    @Column({ type: DataType.UUID, allowNull: true })
    chapterId?: string;

    @BelongsTo(() => Chapter)
    chapter?: Chapter;

    @Column({
        type: DataType.ENUM(...Object.values(TransactionType)),
        allowNull: false,
    })
    type: TransactionType;

    @Column({
        type: DataType.DECIMAL(12, 2),
        allowNull: false,
    })
    amount: number;

    @Column({
        type: DataType.STRING,
        defaultValue: 'USD',
    })
    currency: string;

    @Column({
        type: DataType.ENUM(...Object.values(TransactionStatus)),
        defaultValue: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @Column({ type: DataType.STRING, allowNull: true })
    stripePaymentIntentId?: string;

    @Column({ type: DataType.STRING, allowNull: true, unique: true })
    referenceNumber?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    membershipTier?: string; // Captured at time of transaction

    @Column({ type: DataType.JSONB, allowNull: true })
    metadata?: any; // For product IDs, etc.
}
