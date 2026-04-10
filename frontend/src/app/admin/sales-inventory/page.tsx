"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Edit,
    Layers,
    X,
    Image as ImageIcon
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    imageUrl?: string;
    totalSold: number;
    status: string;
    createdAt: string;
}

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    outOfStockProducts: number;
    lowStockAlert: number;
    recentOrders?: any[];
}

export default function SalesInventoryPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterTier, setFilterTier] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    const handleCardClick = (tier: string) => {
        setFilterTier(prev => prev === tier ? "all" : tier);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, statsRes] = await Promise.all([
                api.get("/store/products"),
                api.get("/store/stats")
            ]);
            setProducts(prodRes.data.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to fetch store data:", error);
            toast.error("Failed to sync inventory records");
        } finally {
            setLoading(false);
        }
    };


    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-tatt-lime animate-spin" />
                <p className="text-tatt-gray font-bold uppercase tracking-widest text-xs">Syncing Inventory Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight leading-none italic uppercase">
                        Inventory & Sales
                    </h1>
                    <p className="text-tatt-gray text-sm font-bold mt-2 uppercase tracking-widest">
                        Manage global merchandise, supplies, and orders
                    </p>
                </div>
                <button 
                    onClick={() => router.push("/admin/sales-inventory/add")}
                    className="bg-tatt-lime hover:brightness-105 text-tatt-black font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-tatt-lime/20 transition-all text-sm uppercase tracking-widest"
                >
                    <Plus size={20} /> Add New Item
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm group hover:border-tatt-lime/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-tatt-lime/10 rounded-lg text-tatt-lime">
                            <DollarSign size={20} />
                        </div>
                        <TrendingUp size={16} className="text-tatt-lime" />
                    </div>
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Total Revenue</p>
                    <h3 className="text-2xl font-black mt-1">
                        ${stats?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm group hover:border-tatt-lime/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-tatt-lime/10 rounded-lg text-tatt-lime">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Total Orders</p>
                    <h3 className="text-2xl font-black mt-1">{stats?.totalOrders}</h3>
                </div>

                <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm group hover:border-tatt-lime/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-tatt-lime/10 rounded-lg text-tatt-lime">
                            <Package size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Avg. Order Value</p>
                    <h3 className="text-2xl font-black mt-1">
                        ${stats?.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                </div>

                <div className={`bg-surface rounded-3xl border p-6 shadow-sm group transition-colors ${
                    (stats?.lowStockAlert || 0) > 0 ? 'border-tatt-bronze/50' : 'border-border'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${
                            (stats?.lowStockAlert || 0) > 0 ? 'bg-tatt-bronze/10 text-tatt-bronze' : 'bg-tatt-gray/10 text-tatt-gray'
                        }`}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Low Stock Alerts</p>
                    <h3 className="text-2xl font-black mt-1">{stats?.lowStockAlert}</h3>
                </div>
            </div>

            {/* Inventory Table Area */}
            <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tatt-gray" />
                        <input 
                            type="text"
                            placeholder="Filter by product name or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-tatt-lime/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-background border border-border rounded-xl text-tatt-gray hover:text-foreground transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background/50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Product Item</th>
                                <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Stock Level</th>
                                <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Total Sales</th>
                                <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Package className="h-10 w-10 mx-auto text-tatt-gray/40 mb-4" />
                                        <h3 className="font-bold text-lg text-foreground">No merchandise found</h3>
                                        <p className="text-sm text-tatt-gray mt-1">Start by adding your first product to the catalog.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-background/30 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-black text-foreground">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt="" className="size-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-tatt-gray/30" />
                                                    )}
                                                </div>
                                                <div 
                                                    className="flex flex-col cursor-pointer group/name"
                                                    onClick={() => router.push(`/admin/sales-inventory/${product.id}`)}
                                                >
                                                    <span className="uppercase tracking-tight underline decoration-tatt-lime/30 underline-offset-4 group-hover/name:text-tatt-lime transition-colors">{product.name}</span>
                                                    <span className="text-[10px] text-tatt-gray uppercase">SKU-{product.id.slice(0,8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black bg-tatt-lime/10 text-tatt-lime border border-tatt-lime/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground">
                                            ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    product.stock === 0 ? 'text-red-500' : 
                                                    product.stock <= product.lowStockThreshold ? 'text-tatt-bronze' : 
                                                    'text-tatt-lime'
                                                }`}>
                                                    {product.stock === 0 ? 'Out of Stock' : product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                                                </span>
                                                <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden border border-border">
                                                    <div 
                                                        className={`h-full transition-all ${
                                                            product.stock === 0 ? 'bg-red-500' : 
                                                            product.stock <= product.lowStockThreshold ? 'bg-tatt-bronze' : 
                                                            'bg-tatt-lime'
                                                        }`}
                                                        style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[8px] font-bold text-tatt-gray uppercase">{product.stock} Units left</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground">
                                            {product.totalSold.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                <button 
                                                    onClick={() => router.push(`/admin/sales-inventory/edit/${product.id}`)}
                                                    className="p-2 bg-background border border-border rounded-lg text-tatt-gray hover:text-tatt-lime transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => router.push(`/admin/sales-inventory/${product.id}`)}
                                                    className="p-2 bg-background border border-border rounded-lg text-tatt-gray hover:text-foreground transition-colors"
                                                    title="View Full Details"
                                                >
                                                    <Layers size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-border flex items-center justify-between">
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">
                        Showing {filteredProducts.length} of {products.length} Products
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-border rounded-lg hover:bg-background transition-colors disabled:opacity-30">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="p-2 border border-border rounded-lg hover:bg-background transition-colors disabled:opacity-30">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders List */}
                <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-border flex items-center justify-between">
                        <h2 className="text-xl font-black italic uppercase tracking-tight">Recent Orders</h2>
                        <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline">View All Orders</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background/50 border-b border-border">
                                    <th className="px-8 py-4 text-[10px] font-black text-tatt-gray uppercase tracking-widest">Order ID</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-tatt-gray uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-tatt-gray uppercase tracking-widest">Items</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-tatt-gray uppercase tracking-widest">Total</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-tatt-gray uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                                    stats.recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-background/30 transition-colors">
                                            <td className="px-8 py-4 text-xs font-bold text-foreground font-mono">
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-tight">
                                                        {order.customerName || (order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest')}
                                                    </span>
                                                    <span className="text-[10px] text-tatt-gray italic">{order.customerEmail || 'No email'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-tatt-gray">
                                                {order.items?.length || 0} Items
                                            </td>
                                            <td className="px-8 py-4 text-xs font-black">
                                                ${Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border transition-colors ${
                                                    order.status === 'DELIVERED' ? 'bg-tatt-lime/10 text-tatt-lime border-tatt-lime/20' :
                                                    order.status === 'PENDING' ? 'bg-tatt-yellow/10 text-tatt-yellow-mustard border-tatt-yellow/20' :
                                                    order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-tatt-gray/10 text-tatt-gray border-tatt-gray/20'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center text-tatt-gray text-xs font-bold uppercase tracking-widest">
                                            No recent orders to show
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Popular Products Sidebar */}
                <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm p-8">
                    <h2 className="text-xl font-black italic uppercase tracking-tight mb-6">Top Sellers</h2>
                    <div className="space-y-6">
                        {[...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 4).map((product) => (
                            <div key={product.id} className="flex items-center gap-4 group">
                                <div className="size-12 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0">
                                    {product.imageUrl ? <img src={product.imageUrl} alt="" className="size-full object-cover" /> : <ImageIcon className="size-5 m-auto text-tatt-gray/20" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight truncate group-hover:text-tatt-lime transition-colors">
                                        {product.name}
                                    </p>
                                    <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest">
                                        {product.totalSold} Sold
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black">${product.price}</p>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && (
                            <p className="text-center text-tatt-gray text-xs font-bold uppercase tracking-widest py-10">
                                No sales data yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
