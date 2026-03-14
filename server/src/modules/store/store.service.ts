import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Product, ProductCategory, ProductStatus } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../iam/entities/user.entity';
import { NotificationsService } from '../notifications/services/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { SystemRole } from '../iam/enums/roles.enum';
import {
    CreateProductDto, UpdateProductDto, AdjustStockDto,
    CreateVariantDto, CreateOrderDto, UpdateOrderStatusDto,
} from './dto/store.dto';

@Injectable()
export class StoreService {
    constructor(
        @InjectModel(Product) private productRepo: typeof Product,
        @InjectModel(ProductVariant) private variantRepo: typeof ProductVariant,
        @InjectModel(Order) private orderRepo: typeof Order,
        @InjectModel(OrderItem) private orderItemRepo: typeof OrderItem,
        @InjectModel(User) private userRepo: typeof User,
        private notificationsService: NotificationsService,
    ) { }

    // ─── PRODUCTS ──────────────────────────────────────────────────────────────

    async getProducts(query: { search?: string; category?: string; status?: string; page?: number; limit?: number }) {
        const { search, category, status, page = 1, limit = 20 } = query;
        const where: any = {};
        if (search) where.name = { [Op.iLike]: `%${search}%` };
        if (category) where.category = category;
        if (status) where.status = status;

        const { rows, count } = await this.productRepo.findAndCountAll({
            where,
            include: [{ model: ProductVariant }],
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });
        return { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
    }

    async getProductById(id: string) {
        const product = await this.productRepo.findByPk(id, {
            include: [{ model: ProductVariant }],
        });
        if (!product) throw new NotFoundException(`Product ${id} not found`);
        return product;
    }

    async createProduct(dto: CreateProductDto) {
        const { variants, ...productData } = dto;
        
        return this.productRepo.sequelize.transaction(async (t) => {
            const product = await this.productRepo.create({ ...productData } as any, { transaction: t });
            
            if (variants && variants.length > 0) {
                const variantsToCreate = variants.map(v => ({
                    ...v,
                    productId: product.id,
                    // Ensure backward compatibility by mapping specific fields to label if needed
                    label: v.label || `${v.size || ''} ${v.color || ''}`.trim() || 'Default',
                    type: v.type || 'VARIANT'
                }));
                await this.variantRepo.bulkCreate(variantsToCreate as any, { transaction: t });
            }
            
            return this.getProductById(product.id);
        });
    }

    async updateProduct(id: string, dto: UpdateProductDto) {
        const product = await this.getProductById(id);
        const updateData: any = { ...dto };
        if (dto.dropStart) updateData.dropStart = new Date(dto.dropStart);
        if (dto.dropEnd) updateData.dropEnd = new Date(dto.dropEnd);
        await product.update(updateData);
        return product;
    }

    async adjustStock(id: string, dto: AdjustStockDto) {
        const product = await this.getProductById(id);
        const newStock = Number(product.stock) + Number(dto.adjustment);
        if (newStock < 0) throw new BadRequestException('Stock cannot go below 0');
        await product.update({ stock: newStock });
        
        // Trigger low stock check
        await this.checkLowStock(product.id);
        
        return { message: 'Stock updated', stock: newStock };
    }

    async deleteProduct(id: string) {
        const product = await this.getProductById(id);
        await product.destroy();
        return { message: 'Product deleted' };
    }

    // ─── VARIANTS ──────────────────────────────────────────────────────────────

    async addVariant(productId: string, dto: CreateVariantDto) {
        await this.getProductById(productId); // ensure exists
        return this.variantRepo.create({ productId, ...dto } as any);
    }

    async updateVariantStock(variantId: string, stock: number) {
        const v = await this.variantRepo.findByPk(variantId);
        if (!v) throw new NotFoundException('Variant not found');
        await v.update({ stock: Number(stock) });
        
        // Trigger low stock check on parent product
        await this.checkLowStock(v.productId);
        
        return v;
    }

    async deleteVariant(variantId: string) {
        const v = await this.variantRepo.findByPk(variantId);
        if (!v) throw new NotFoundException('Variant not found');
        await v.destroy();
        return { message: 'Variant deleted' };
    }

    // ─── ORDERS ────────────────────────────────────────────────────────────────

    async getOrders(query: { status?: string; search?: string; page?: number; limit?: number }) {
        const { status, search, page = 1, limit = 20 } = query;
        const where: any = {};
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { orderNumber: { [Op.iLike]: `%${search}%` } },
                { customerName: { [Op.iLike]: `%${search}%` } },
                { customerEmail: { [Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows, count } = await this.orderRepo.findAndCountAll({
            where,
            include: [
                { model: OrderItem, include: [Product, ProductVariant] },
                { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });
        return { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
    }

    async getOrderById(id: string) {
        const order = await this.orderRepo.findByPk(id, {
            include: [
                { model: OrderItem, include: [Product, ProductVariant] },
                { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
            ],
        });
        if (!order) throw new NotFoundException(`Order ${id} not found`);
        return order;
    }

    async createOrder(dto: CreateOrderDto) {
        if (!dto.items?.length) throw new BadRequestException('Order must have at least one item');

        let total = 0;
        const resolvedItems: { product: Product; variant?: ProductVariant; quantity: number }[] = [];

        for (const item of dto.items) {
            const product = await this.getProductById(item.productId);
            let variant: ProductVariant | null = null;
            if (item.variantId) {
                variant = await this.variantRepo.findByPk(item.variantId);
                if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
                if (variant.stock < item.quantity) throw new BadRequestException(`Insufficient variant stock for ${product.name}`);
            } else {
                if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const unitPrice = Number(product.price) + Number(variant?.priceAdjustment ?? 0);
            total += unitPrice * item.quantity;
            resolvedItems.push({ product, variant: variant ?? undefined, quantity: item.quantity });
        }

        const orderNumber = `TATT-${Date.now()}`;
        const order = await this.orderRepo.create({
            orderNumber,
            customerId: dto.customerId,
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            shippingAddress: dto.shippingAddress,
            notes: dto.notes,
            totalAmount: total,
            status: OrderStatus.PENDING,
        } as any);

        for (const ri of resolvedItems) {
            await this.orderItemRepo.create({
                orderId: order.id,
                productId: ri.product.id,
                variantId: ri.variant?.id,
                quantity: ri.quantity,
                unitPrice: Number(ri.product.price) + Number(ri.variant?.priceAdjustment ?? 0),
            } as any);

            // Decrement stock
            if (ri.variant) {
                await ri.variant.update({ stock: ri.variant.stock - ri.quantity });
            } else {
                await ri.product.update({
                    stock: ri.product.stock - ri.quantity,
                    totalSold: ri.product.totalSold + ri.quantity,
                });
            }
            
            // Trigger low stock check
            await this.checkLowStock(ri.product.id);
        }

        return this.getOrderById(order.id);
    }

    async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
        const order = await this.getOrderById(id);
        await order.update({ status: dto.status, trackingNumber: dto.trackingNumber, notes: dto.notes });
        return order;
    }

    // ─── DASHBOARD STATS ───────────────────────────────────────────────────────

    async getDashboardStats() {
        const [totalProducts, totalOrders, lowStockProducts, outOfStockProducts] = await Promise.all([
            this.productRepo.count({ where: { status: ProductStatus.ACTIVE } }),
            this.orderRepo.count(),
            this.productRepo.count({
                where: {
                    stock: { [Op.gt]: 0 },
                    status: ProductStatus.ACTIVE,
                },
            }),
            this.productRepo.count({ where: { stock: 0, status: ProductStatus.ACTIVE } }),
        ]);

        // Revenue from confirmed/delivered/shipped orders
        const revenueResult = await this.orderRepo.findAll({
            where: { status: { [Op.in]: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
            attributes: ['totalAmount'],
        });
        const totalRevenue = revenueResult.reduce((s, o) => s + Number(o.totalAmount), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Low stock count (above 0 but below or equal to threshold)
        const lowStockAlert = await this.productRepo.count({
            where: {
                stock: { [Op.and]: [{ [Op.gt]: 0 }, { [Op.lte]: this.productRepo.sequelize.col('lowStockThreshold') }] },
                status: ProductStatus.ACTIVE,
            },
        });

        const recentOrders = await this.orderRepo.findAll({
            order: [['createdAt', 'DESC']],
            limit: 6,
            include: [
                { model: OrderItem, include: [Product] },
                { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
            ],
        });

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            totalProducts,
            outOfStockProducts,
            lowStockAlert,
            recentOrders,
        };
    }
    // ─── UTILS ─────────────────────────────────────────────────────────────────

    private async checkLowStock(productId: string) {
        const product = await this.productRepo.findByPk(productId, {
            include: [{ model: ProductVariant }]
        });
        if (!product) return;

        const isLow = product.stock <= product.lowStockThreshold || 
                     (product.variants && product.variants.some(v => v.stock <= product.lowStockThreshold));

        if (isLow) {
            await this.notifyOrgMembers(
                'Low Stock Alert',
                `Warning: Product "${product.name}" is running low on stock. Current level: ${product.stock}`,
                product.id
            );
        }
    }

    private async notifyOrgMembers(title: string, message: string, productId: string) {
        const staff = await this.userRepo.findAll({
            where: {
                systemRole: { [Op.in]: [SystemRole.ADMIN, SystemRole.SUPERADMIN, SystemRole.REGIONAL_ADMIN] }
            }
        });

        for (const user of staff) {
            await this.notificationsService.create(
                user.id,
                NotificationType.LOW_STOCK,
                title,
                message,
                { productId },
                true
            );
        }
    }
}
