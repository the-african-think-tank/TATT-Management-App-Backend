import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from './entities/event.entity';
import { EventChapter } from './entities/event-chapter.entity';
import { EventGuest } from './entities/event-guest.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { User } from '../iam/entities/user.entity';
import { Chapter } from '../chapters/entities/chapter.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { SystemRole, CommunityTier } from '../iam/enums/roles.enum';
import { Op } from 'sequelize';
import Stripe from 'stripe';
import { MailService } from '../../common/mail/mail.service';

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
            attributes: ['email', 'firstName'],
        });

        const dateStr = event.dateTime.toLocaleString();

        // Notify in background
        users.forEach(user => {
            this.mailService.sendEventNotification(
                user.email,
                user.firstName,
                event.title,
                dateStr,
                event.type,
                event.id
            ).catch(err => this.logger.error(`Failed to notify ${user.email} about event ${event.id}`, err.stack));
        });

        this.logger.log(`Queued notifications for ${users.length} members for event: ${event.title}`);
    }

    async getEvents(viewer: User) {
        // Optionally filter by membership if we want to hide restricted events from the list
        // Requirement says "it should show up in the events and workshops page", implying it might be visible but maybe locked?
        // Usually restricted events are only visible to those who can join.
        // Let's allow everyone to see them for now, but restrict registration.
        return this.eventRepo.findAll({
            include: [
                { model: EventChapter, include: [Chapter] },
                { model: User, as: 'featuredGuests', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
            ],
            order: [['dateTime', 'ASC']],
        });
    }

    async getEvent(id: string) {
        const event = await this.eventRepo.findByPk(id, {
            include: [
                { model: EventChapter, include: [Chapter] },
                { model: User, as: 'featuredGuests', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
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

        let amountToPay = 0;
        if (dto.isBusinessRegistration) {
            if (user.communityTier !== CommunityTier.KIONGOZI) {
                amountToPay = 75.00;
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
}
