import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { JobListing } from './job-listing.entity';

@Table({
    tableName: 'saved_jobs',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'jobId'] }],
})
export class SavedJob extends Model<SavedJob> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => JobListing)
    @Column({ type: DataType.UUID, allowNull: false })
    jobId: string;

    @BelongsTo(() => JobListing)
    job: JobListing;
}
