import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

export enum FaqCategory {
    MEMBERSHIP = 'MEMBERSHIP',
    EVENTS = 'EVENTS',
    TECHNICAL = 'TECHNICAL',
    GENERAL = 'GENERAL'
}

@Table({ tableName: 'support_faqs', timestamps: true })
export class SupportFaq extends Model<SupportFaq> {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    question: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    answer: string;

    @Default('GENERAL')
    @Column({ type: DataType.STRING })
    category: string;

    @Default(true)
    @Column({ type: DataType.BOOLEAN })
    isActive: boolean;
}
