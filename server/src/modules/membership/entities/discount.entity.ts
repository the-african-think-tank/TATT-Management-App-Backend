import {
    Table, Column, Model, DataType, Default,
} from 'sequelize-typescript';

export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

export enum DiscountDuration {
    FOREVER = 'forever',
    REPEATING = 'repeating',
    ONCE = 'once',
}

@Table({
    tableName: 'discounts',
    timestamps: true,
})
export class Discount extends Model<Discount> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    code: string;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({
        type: DataType.ENUM(...Object.values(DiscountType)),
        allowNull: false,
    })
    discountType: DiscountType;

    @Column({ type: DataType.INTEGER, allowNull: false })
    value: number; // e.g. 10 for 10% or 500 for $5.00

    @Column({
        type: DataType.ENUM(...Object.values(DiscountDuration)),
        allowNull: false,
    })
    duration: DiscountDuration;

    @Column({ type: DataType.INTEGER, allowNull: true })
    durationMonths?: number;

    @Column({ type: DataType.STRING, allowNull: true })
    stripeCouponId?: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        defaultValue: [],
    })
    applicablePlans: string[];

    @Column({ type: DataType.DATE, allowNull: true })
    validUntil?: Date;

    @Default(true)
    @Column(DataType.BOOLEAN)
    isActive: boolean;

    @Default(false)
    @Column(DataType.BOOLEAN)
    applyToAnnualOnly: boolean;
}
