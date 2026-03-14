import { Injectable, NotFoundException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/store.dto';

import { StoreService } from './store.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/store.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart) private readonly cartRepo: typeof Cart,
        @InjectModel(CartItem) private readonly itemRepo: typeof CartItem,
        @InjectModel(Order) private readonly orderRepo: typeof Order,
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService,
    ) { }

    async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
        let cart: Cart;
        const include = [{ 
            model: CartItem, 
            include: [
                { model: Product }, 
                { model: ProductVariant }
            ] 
        }];

        if (userId) {
            [cart] = await this.cartRepo.findOrCreate({
                where: { userId },
                include,
            });
        } else if (sessionId) {
            [cart] = await this.cartRepo.findOrCreate({
                where: { sessionId },
                include,
            });
        } else {
            throw new BadRequestException('Either userId or sessionId must be provided');
        }
        return cart;
    }

    async addItem(dto: AddToCartDto, userId?: string) {
        const { productId, variantId, quantity = 1, sessionId } = dto;
        const cart = await this.getOrCreateCart(userId, sessionId);

        let item = await this.itemRepo.findOne({
            where: { cartId: cart.id, productId, variantId: variantId || null },
        });

        if (item) {
            item.quantity += quantity;
            await item.save();
        } else {
            item = await this.itemRepo.create({
                cartId: cart.id,
                productId,
                variantId,
                quantity,
            } as any);
        }

        return this.getOrCreateCart(userId, sessionId);
    }

    async updateItem(itemId: string, dto: UpdateCartItemDto) {
        const item = await this.itemRepo.findByPk(itemId);
        if (!item) throw new NotFoundException('Cart item not found');
        item.quantity = dto.quantity;
        await item.save();
        return item;
    }

    async removeItem(itemId: string) {
        const item = await this.itemRepo.findByPk(itemId);
        if (!item) throw new NotFoundException('Cart item not found');
        await item.destroy();
        return { success: true };
    }

    async clearCart(userId?: string, sessionId?: string) {
        const cart = await this.getOrCreateCart(userId, sessionId);
        await this.itemRepo.destroy({ where: { cartId: cart.id } });
        return { success: true };
    }

    async checkout(dto: CreateOrderDto, sessionId?: string) {
        // Fetch cart items to verify
        const cart = await this.getOrCreateCart(dto.customerId, sessionId);
        if (!cart.items?.length) throw new Error('Cart is empty');

        // Create Order using StoreService logic
        const order = await this.storeService.createOrder({
            ...dto,
            items: cart.items.map(i => ({
                productId: i.productId,
                variantId: i.variantId,
                quantity: i.quantity
            }))
        });

        // Clear cart after successful order
        await this.clearCart(dto.customerId, sessionId);

        return order;
    }
}
