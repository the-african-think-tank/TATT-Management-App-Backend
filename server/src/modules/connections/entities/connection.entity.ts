import {
    Table, Column, Model, DataType, Default,
    ForeignKey, BelongsTo, HasMany,
} from 'sequelize-typescript';
import { User } from '../../iam/entities/user.entity';
import { DirectMessage } from '../../messages/entities/direct-message.entity';

export enum ConnectionStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    WITHDRAWN = 'WITHDRAWN',
}

@Table({
    tableName: 'connections',
    timestamps: true,
    paranoid: true, // Soft delete allows "terminating" a connection while preserving ID history
})
export class Connection extends Model<Connection> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    // The member sending the request
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    requesterId: string;

    @BelongsTo(() => User, 'requesterId')
    requester: User;

    // The member receiving the request
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    recipientId: string;

    @BelongsTo(() => User, 'recipientId')
    recipient: User;

    // Mandatory personalised connection message
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    message: string;

    @Default(ConnectionStatus.PENDING)
    @Column({
        type: DataType.ENUM(...Object.values(ConnectionStatus)),
        allowNull: false,
    })
    status: ConnectionStatus;

    @HasMany(() => DirectMessage, 'connectionId')
    messages: DirectMessage[];
}
