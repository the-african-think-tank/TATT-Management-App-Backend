import {
    Table, Column, Model, DataType,
    ForeignKey, BelongsTo, Default,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { Post } from './post.entity';

export enum ReportAction {
    DELETE = 'DELETE',
    LIMIT_RECOMMENDATION = 'LIMIT_RECOMMENDATION',
}

export enum ReportStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
    DISMISSED = 'DISMISSED',
}

@Table({
    tableName: 'post_reports',
    timestamps: true,
})
export class PostReport extends Model<PostReport> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ForeignKey(() => Post)
    @Column({ type: DataType.UUID, allowNull: false })
    postId: string;

    @BelongsTo(() => Post, 'postId')
    post: Post;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    reporterId: string;

    @BelongsTo(() => User, 'reporterId')
    reporter: User;

    @Column({ type: DataType.TEXT, allowNull: false })
    reason: string;

    @Column({
        type: DataType.ENUM(...Object.values(ReportAction)),
        allowNull: false,
    })
    suggestedAction: ReportAction;

    @Default(ReportStatus.PENDING)
    @Column({
        type: DataType.ENUM(...Object.values(ReportStatus)),
        allowNull: false,
    })
    status: ReportStatus;

    @Column({ type: DataType.TEXT, allowNull: true })
    adminNotes?: string;
}
