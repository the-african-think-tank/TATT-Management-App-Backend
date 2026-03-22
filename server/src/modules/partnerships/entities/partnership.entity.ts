import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    AllowNull,
    Unique,
    CreatedAt,
    UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'partnerships' })
export class Partnership extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    email: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    category: string;

    @Default([])
    @Column(DataType.JSONB)
    tierAccess: string[];

    @AllowNull(true)
    @Column(DataType.INTEGER)
    quotaAmount: number; // Null for unlimited

    @Default(0)
    @Column(DataType.INTEGER)
    quotaUsed: number;

    @AllowNull(false)
    @Default('ACTIVE')
    @Column(DataType.ENUM('ACTIVE', 'INACTIVE'))
    status: 'ACTIVE' | 'INACTIVE';

    @AllowNull(true)
    @Column(DataType.STRING)
    logoUrl: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    description: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    website: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    buttonLabel: string; // e.g. "Claim Perk", "Join Pilot"

    @AllowNull(true)
    @Column(DataType.STRING)
    redemptionLink: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    contactName: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    contactPosition: string;

    @AllowNull(false)
    @Default('MONTHLY')
    @Column(DataType.ENUM('MONTHLY', 'ANNUAL'))
    quotaReset: 'MONTHLY' | 'ANNUAL';

    @AllowNull(true)
    @Default({})
    @Column(DataType.JSONB)
    tierQuotas: Record<string, number | null>; // e.g. { "UBUNTU": 25, "IMANI": null }

    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    fullPrice: number;

    @AllowNull(true)
    @Column(DataType.DECIMAL(10, 2))
    discountedPrice: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
