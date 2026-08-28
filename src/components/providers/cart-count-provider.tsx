"use client";

import { getCart } from "@/app/features/carts/actions/cart-action";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type CartCountContextValue = {
    cartItemsCount: number;
    refreshCartCount: () => Promise<void>;
};

const CartCountContext = createContext<CartCountContextValue | null>(null);

export function CartCountProvider({ children }: { children: React.ReactNode }) {
    const [cartItemsCount, setCartItemsCount] = useState(0);

    const refreshCartCount = useCallback(async () => {
        const result = await getCart();
        if (result.success) {
            setCartItemsCount(result.data?.items.length ?? 0);
        }
    }, []);

    useEffect(() => {
        void refreshCartCount();
    }, [refreshCartCount]);

    return (
        <CartCountContext.Provider value={{ cartItemsCount, refreshCartCount }}>
            {children}
        </CartCountContext.Provider>
    );
}

export function useCartCount() {
    const context = useContext(CartCountContext);
    if (!context) {
        throw new Error("useCartCount must be used within a CartCountProvider.");
    }
    return context;
}