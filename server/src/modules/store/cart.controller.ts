import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards, Req
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, CreateOrderDto } from './dto/store.dto';

@ApiTags('Cart')
@Controller('store/cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Public()
    @ApiOperation({ summary: 'Checkout cart' })
    @Post('checkout')
    checkout(@Body() dto: CreateOrderDto, @Query('sessionId') sessionId?: string) {
        return this.cartService.checkout(dto, sessionId);
    }

    @Public()
    @ApiOperation({ summary: 'Get current cart (Guest or User)' })
    @ApiQuery({ name: 'sessionId', required: false })
    @Get()
    getCart(@Req() req: any, @Query('sessionId') sessionId?: string) {
        const userId = req.user?.id;
        return this.cartService.getOrCreateCart(userId, sessionId);
    }

    @Public()
    @ApiOperation({ summary: 'Add item to cart' })
    @Post('items')
    addItem(@Req() req: any, @Body() dto: AddToCartDto) {
        const userId = req.user?.id;
        return this.cartService.addItem(dto, userId);
    }

    @Public()
    @ApiOperation({ summary: 'Update cart item quantity' })
    @Patch('items/:id')
    updateItem(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
        return this.cartService.updateItem(id, dto);
    }

    @Public()
    @ApiOperation({ summary: 'Remove item from cart' })
    @Delete('items/:id')
    removeItem(@Param('id') id: string) {
        return this.cartService.removeItem(id);
    }

    @Public()
    @ApiOperation({ summary: 'Clear cart' })
    @ApiQuery({ name: 'sessionId', required: false })
    @Delete()
    clearCart(@Req() req: any, @Query('sessionId') sessionId?: string) {
        const userId = req.user?.id;
        return this.cartService.clearCart(userId, sessionId);
    }
}
