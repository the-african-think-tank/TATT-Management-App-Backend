import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'membership_plans' })
export class MembershipPlan extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    tier: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column(DataType.TEXT)
    tagline: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0,
    })
    monthlyPrice: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0,
    })
    yearlyPrice: number;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        defaultValue: [],
    })
    features: string[];

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isPopular: boolean;

    @Column(DataType.STRING)
    stripeMonthlyPriceId: string;

    @Column(DataType.STRING)
    stripeYearlyPriceId: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    hasYearlyDiscount: boolean;
}
