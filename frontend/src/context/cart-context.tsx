"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    product: {
        name: string;
        price: number;
        imageUrl: string;
    };
    variant?: {
        label: string;
        priceAdjustment: number;
    };
}

interface Cart {
    id: string;
    items: CartItem[];
}

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Initialize Session ID Safely
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                let sid = localStorage.getItem("tatt_cart_sid");
                if (!sid) {
                    sid = uuidv4();
                    localStorage.setItem("tatt_cart_sid", sid);
                }
                setSessionId(sid);
            }
        } catch (error) {
            console.error("[Cart] Storage access failed. Using transient session ID.", error);
            // Fallback to a one-time ID for this session if storage is blocked
            setSessionId(uuidv4());
        }
    }, []);

    useEffect(() => {
        if (sessionId) {
            fetchCart();
        }
    }, [sessionId]);

    const fetchCart = async () => {
        try {
            const res = await api.get("/store/cart", { params: { sessionId } });
            setCart(res.data);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (productId: string, variantId?: string, quantity: number = 1) => {
        try {
            const res = await api.post("/store/cart/items", {
                productId,
                variantId,
                quantity,
                sessionId
            });
            setCart(res.data);
            toast.success("Added to collection");
        } catch (error) {
            toast.error("Failed to add item");
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        try {
            await api.patch(`/store/cart/items/${itemId}`, { quantity });
            // Refresh cart
            fetchCart();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            await api.delete(`/store/cart/items/${itemId}`);
            fetchCart();
            toast.success("Item removed");
        } catch (error) {
            toast.error("Remove failed");
        }
    };

    const clearCart = async () => {
        try {
            await api.delete("/store/cart", { params: { sessionId } });
            setCart({ id: cart?.id || "", items: [] });
            toast.success("Cart cleared");
        } catch (error) {
            toast.error("Clear failed");
        }
    };

    const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const subtotal = cart?.items?.reduce((sum, item) => {
        const basePrice = Number(item.product.price);
        const adjustment = Number(item.variant?.priceAdjustment || 0);
        return sum + (basePrice + adjustment) * item.quantity;
    }, 0) || 0;

    return (
        <CartContext.Provider value={{ 
            cart, 
            loading, 
            addItem, 
            updateQuantity, 
            removeItem, 
            clearCart,
            totalItems,
            subtotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};
