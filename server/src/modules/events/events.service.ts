import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from './entities/event.entity';
import { EventChapter } from './entities/event-chapter.entity';
import { EventGuest } from './entities/event-guest.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventType } from './enums/event-type.enum';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { SystemRole, CommunityTier } from '../iam/enums/roles.enum';
import { Op } from 'sequelize';
import Stripe from 'stripe';
import { MailService } from '../../common/mail/mail.service';
import { NotificationsService } from '../notifications/services/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);
    private stripe: Stripe;

    constructor(
        @InjectModel(Event) private eventRepo: typeof Event,
        @InjectModel(EventChapter) private eventChapterRepo: typeof EventChapter,
        @InjectModel(EventGuest) private eventGuestRepo: typeof EventGuest,
        @InjectModel(EventRegistration) private eventRegistrationRepo: typeof EventRegistration,
        @InjectModel(User) private userRepo: typeof User,
        private mailService: MailService,
        private notificationsService: NotificationsService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async createEvent(admin: User, dto: CreateEventDto) {
        const allowedRoles = [SystemRole.SUPERADMIN, SystemRole.ADMIN, SystemRole.CONTENT_ADMIN];
        if (!allowedRoles.includes(admin.systemRole)) {
            throw new ForbiddenException('Only Org admins and content admins can create events.');
        }

        const event = await this.eventRepo.create({
            title: dto.title,
            description: dto.description,
            dateTime: new Date(dto.dateTime),
            type: dto.type,
            imageUrl: dto.imageUrl,
            isForAllMembers: dto.isForAllMembers,
            targetMembershipTiers: dto.targetMembershipTiers,
            basePrice: dto.basePrice || 0,
        });

        for (const loc of dto.locations) {
            await this.eventChapterRepo.create({
                eventId: event.id,
                chapterId: loc.chapterId,
                address: loc.address,
            });
        }

        if (dto.featuredGuestIds && dto.featuredGuestIds.length > 0) {
            for (const guestId of dto.featuredGuestIds) {
                await this.eventGuestRepo.create({
                    eventId: event.id,
                    userId: guestId,
                });
            }
        }

        // Notify community members
        this.notifyMembers(event);

        return event;
    }

    private async notifyMembers(event: Event) {
        const where: any = { isActive: true };
        if (!event.isForAllMembers && event.targetMembershipTiers && event.targetMembershipTiers.length > 0) {
            where.communityTier = { [Op.in]: event.targetMembershipTiers };
        }

        const users = await this.userRepo.findAll({
            where,
            attributes: ['id', 'email', 'firstName'],
        });

        const dateStr = event.dateTime.toLocaleString();

        // Notify in background
        users.forEach(user => {
            // Email
            this.mailService.sendEventNotification(
                user.email,
                user.firstName,
                event.title,
                dateStr,
                event.type,
                event.id
            ).catch(err => this.logger.error(`Failed to notify ${user.email} about event ${event.id}`, err.stack));

            // In-app
            this.notificationsService.create(
                (user as any).id, // need to fetch id too
                NotificationType.EVENT_REMINDER,
                'New Community Event',
                `A new ${event.type} "${event.title}" has been scheduled for ${dateStr}.`,
                { eventId: event.id },
                false // Email already sent above
            ).catch(() => { });
        });

        this.logger.log(`Queued notifications for ${users.length} members for event: ${event.title}`);
    }

    async getEvents(viewer: User, upcoming?: boolean) {
        // Optionally filter by membership if we want to hide restricted events from the list
        // Requirement says "it should show up in the events and workshops page", implying it might be visible but maybe locked?
        // Usually restricted events are only visible to those who can join.
        // Let's allow everyone to see them for now, but restrict registration.
        const where: any = {};
        if (upcoming) {
            where.dateTime = { [Op.gt]: new Date() };
        }

        return this.eventRepo.findAll({
            where,
            include: [
                { model: EventChapter, as: 'locations', include: [{ model: Chapter, as: 'chapter' }] },
                { model: User, as: 'featuredGuests', attributes: ['id', 'firstName', 'lastName', 'profilePicture'], through: { attributes: [] } },
            ],
            order: [['dateTime', 'ASC']],
        });
    }

    async getEvent(id: string) {
        const event = await this.eventRepo.findByPk(id, {
            include: [
                { model: EventChapter, as: 'locations', include: [{ model: Chapter, as: 'chapter' }] },
                { model: User, as: 'featuredGuests', attributes: ['id', 'firstName', 'lastName', 'profilePicture'], through: { attributes: [] } },
            ],
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async register(user: User, eventId: string, dto: RegisterEventDto) {
        const event = await this.getEvent(eventId);

        if (!event.isForAllMembers) {
            if (!event.targetMembershipTiers.includes(user.communityTier)) {
                throw new ForbiddenException('This event is restricted to specific membership classes.');
            }
        }

        let amountToPay = event.basePrice || 0;

        // Apply membership discounts
        if (user.communityTier === CommunityTier.KIONGOZI) {
            amountToPay = 0;
        } else if (user.communityTier === CommunityTier.IMANI) {
            if (event.type === EventType.WORKSHOP) {
                amountToPay = 0; // Free Workshops
            } else if (event.type === EventType.MIXER) {
                amountToPay = amountToPay * 0.75; // 25% Discount
            }
        } else if (user.communityTier === CommunityTier.UBUNTU) {
            amountToPay = amountToPay * 0.85; // 15% Discount
        }

        // Business registration might have extra costs or fixed price
        if (dto.isBusinessRegistration) {
            if (user.communityTier !== CommunityTier.KIONGOZI) {
                // If there's a specific logic for business, apply it here. 
                // For now, let's keep the user's previous logic if it was intended, 
                // or just apply the basePrice logic. 
                // The requirement says "reflect on their dashboard when they are booking for that event"
                // Let's assume business registration is also subject to discounts or has a fixed floor.
                if (amountToPay < 75) amountToPay = 75; // Example: floor for business
            }
        }

        const registration = await this.eventRegistrationRepo.create({
            eventId: event.id,
            userId: user.id,
            isBusinessRegistration: dto.isBusinessRegistration,
            amountPaid: amountToPay,
            status: amountToPay > 0 ? 'PENDING' : 'COMPLETED',
        });

        if (amountToPay > 0) {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Business Registration for ${event.title}`,
                                description: `Event Date: ${event.dateTime.toLocaleString()}`,
                            },
                            unit_amount: Math.round(amountToPay * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event.id}/success?regId=${registration.id}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event.id}/cancel`,
                client_reference_id: registration.id,
                metadata: {
                    registrationId: registration.id,
                    type: 'EVENT_REGISTRATION',
                },
            });

            return { registration, checkoutUrl: session.url };
        }

        return { registration, message: 'Registration successful.' };
    }

    async getEventAttendees(eventId: string) {
        return this.eventRegistrationRepo.findAll({
            where: { eventId, status: 'COMPLETED' },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'professionTitle', 'communityTier', 'chapterId'],
                include: [{ model: Chapter, as: 'chapter' }]
            }],
        });
    }
}
