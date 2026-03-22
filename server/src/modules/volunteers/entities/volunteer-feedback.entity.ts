import {
    Table, Column, Model, DataType,
    ForeignKey, BelongsTo, CreatedAt, UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';

@Table({ tableName: 'volunteer_feedback', timestamps: true })
export class VolunteerFeedback extends Model<VolunteerFeedback> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    /** The volunteer being reviewed */
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    volunteerId: string;

    @BelongsTo(() => User, 'volunteerId')
    volunteer: User;

    /** Admin / manager leaving the review */
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    reviewerId: string;

    @BelongsTo(() => User, 'reviewerId')
    reviewer: User;

    /** 1–5 star rating */
    @Column({ type: DataType.INTEGER, allowNull: false })
    rating: number;

    @Column({ type: DataType.TEXT, allowNull: false })
    comment: string;

    /** Optional event / context label (e.g. "Food Drive 2024") */
    @Column({ type: DataType.STRING, allowNull: true })
    eventLabel: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}
