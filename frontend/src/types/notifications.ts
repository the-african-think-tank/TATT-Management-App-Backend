export enum NotificationType {
    CONNECTION_REQUEST = 'CONNECTION_REQUEST',
    CONNECTION_ACCEPTED = 'CONNECTION_ACCEPTED',
    NEW_MESSAGE = 'NEW_MESSAGE',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
    SUBSCRIPTION_DOWNGRADE = 'SUBSCRIPTION_DOWNGRADE',
    EVENT_REMINDER = 'EVENT_REMINDER',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
    VOLUNTEER_ROLE = 'VOLUNTEER_ROLE',
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    readAt?: string;
    dismissedAt?: string;
    createdAt: string;
    updatedAt: string;
}
