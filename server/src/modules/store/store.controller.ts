import {
    Controller, Get, Post, Patch, Delete, Put,
    Body, Param, Query, ParseUUIDPipe, HttpCode, HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemRole } from '../iam/enums/roles.enum';
import { StoreService } from './store.service';
import { ProductStatus } from './entities/product.entity';
import { Public } from '../../common/decorators/public.decorator';
import {
    CreateProductDto, UpdateProductDto, AdjustStockDto,
    CreateVariantDto, CreateOrderDto, UpdateOrderStatusDto,
} from './dto/store.dto';

@ApiTags('Store')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    // ─── STATS ─────────────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Get store dashboard stats' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('stats')
    getStats() { return this.storeService.getDashboardStats(); }

    @Public()
    @ApiOperation({ summary: 'List all published products for visitors' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'category', required: false })
    @Get('public/products')
    getPublicProducts(
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.storeService.getProducts({ 
            search, 
            category, 
            status: ProductStatus.ACTIVE, 
            page: +page, 
            limit: +limit 
        });
    }

    @Public()
    @ApiOperation({ summary: 'Get a product by ID for visitors' })
    @Get('public/products/:id')
    getPublicProduct(@Param('id', ParseUUIDPipe) id: string) {
        return this.storeService.getProductById(id);
    }

    // ─── PRODUCTS ──────────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'List all products' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('products')
    getProducts(
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('status') status?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.storeService.getProducts({ search, category, status, page: +page, limit: +limit });
    }

    @ApiOperation({ summary: 'Get a product by ID' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('products/:id')
    getProduct(@Param('id', ParseUUIDPipe) id: string) {
        return this.storeService.getProductById(id);
    }

    @ApiOperation({ summary: 'Create a new product' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('products')
    @HttpCode(HttpStatus.CREATED)
    createProduct(@Body() dto: CreateProductDto) {
        return this.storeService.createProduct(dto);
    }

    @ApiOperation({ summary: 'Update a product' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('products/:id')
    updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
        return this.storeService.updateProduct(id, dto);
    }

    @ApiOperation({ summary: 'Adjust product stock' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('products/:id/stock')
    adjustStock(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdjustStockDto) {
        return this.storeService.adjustStock(id, dto);
    }

    @ApiOperation({ summary: 'Delete a product (soft delete)' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Delete('products/:id')
    deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
        return this.storeService.deleteProduct(id);
    }

    // ─── VARIANTS ──────────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Add a variant to a product' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('products/:id/variants')
    @HttpCode(HttpStatus.CREATED)
    addVariant(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateVariantDto) {
        return this.storeService.addVariant(id, dto);
    }

    @ApiOperation({ summary: 'Update variant stock' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('variants/:variantId/stock')
    updateVariantStock(
        @Param('variantId', ParseUUIDPipe) variantId: string,
        @Body('stock') stock: number,
    ) {
        return this.storeService.updateVariantStock(variantId, stock);
    }

    @ApiOperation({ summary: 'Delete a variant' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Delete('variants/:variantId')
    deleteVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
        return this.storeService.deleteVariant(variantId);
    }

    // ─── ORDERS ────────────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'List all orders' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('orders')
    getOrders(
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.storeService.getOrders({ status, search, page: +page, limit: +limit });
    }

    @ApiOperation({ summary: 'Get order by ID' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Get('orders/:id')
    getOrder(@Param('id', ParseUUIDPipe) id: string) {
        return this.storeService.getOrderById(id);
    }

    @ApiOperation({ summary: 'Create a new order' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Post('orders')
    @HttpCode(HttpStatus.CREATED)
    createOrder(@Body() dto: CreateOrderDto) {
        return this.storeService.createOrder(dto);
    }

    @ApiOperation({ summary: 'Update order status' })
    @Roles(SystemRole.ADMIN, SystemRole.SUPERADMIN)
    @Patch('orders/:id/status')
    updateOrderStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.storeService.updateOrderStatus(id, dto);
    }
}
