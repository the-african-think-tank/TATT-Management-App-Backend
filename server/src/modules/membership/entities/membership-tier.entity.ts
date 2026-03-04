import {
    Table, Column, Model, DataType, Default,
} from 'sequelize-typescript';
import { CommunityTier } from '../../iam/enums/roles.enum';

@Table({
    tableName: 'membership_tiers',
    timestamps: true,
})
export class MembershipTier extends Model<MembershipTier> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.ENUM(...Object.values(CommunityTier)),
        allowNull: false,
        unique: true,
    })
    tier: CommunityTier;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.TEXT })
    description?: string;

    @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
    perks: string[];

    @Column({ type: DataType.INTEGER, allowNull: false })
    monthlyPrice: number; // in cents or standard unit

    @Column({ type: DataType.INTEGER, allowNull: false })
    yearlyPrice: number;

    @Column({ type: DataType.STRING, allowNull: true })
    monthlyStripePriceId?: string;

    @Column({ type: DataType.STRING, allowNull: true })
    yearlyStripePriceId?: string;

    @Default(true)
    @Column(DataType.BOOLEAN)
    isActive: boolean;
}
