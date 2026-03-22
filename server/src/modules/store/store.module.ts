import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../iam/entities/user.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

@Module({
    imports: [SequelizeModule.forFeature([Product, ProductVariant, Order, OrderItem, User, Cart, CartItem])],
    providers: [StoreService, CartService],
    controllers: [StoreController, CartController],
    exports: [StoreService, CartService],
})
export class StoreModule { }
