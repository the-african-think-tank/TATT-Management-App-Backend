import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

@Table({ tableName: 'business_partners' })
export class BusinessPartner extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    category: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    foundingYear: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    website: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    locationText: string;

    @ForeignKey(() => Chapter)
    @AllowNull(true)
    @Column(DataType.UUID)
    chapterId: string;

    @BelongsTo(() => Chapter)
    chapter: Chapter;

    @AllowNull(false)
    @Column(DataType.TEXT)
    missionAlignment: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    perkOffer: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    logoUrl: string;

    @AllowNull(false)
    @Default('PENDING')
    @Column(DataType.ENUM('PENDING', 'APPROVED', 'DECLINED', 'INACTIVE'))
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'INACTIVE';

    @AllowNull(true)
    @Column(DataType.STRING)
    tierRequested: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    contactEmail: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    contactPhone: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    contactName: string;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    submittedById: string;

    @BelongsTo(() => User)
    submittedBy: User;

    @AllowNull(false)
    @Default(0)
    @Column(DataType.INTEGER)
    clickCount: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    adminNotes: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
