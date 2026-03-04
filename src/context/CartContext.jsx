import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Add item — agar same product + size + color ho toh qty increase
    const addItem = useCallback((product, size, color, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.id === product.id && i.size === size && i.color === color
            );
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id && i.size === size && i.color === color
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...product, size, color, quantity, cartKey: `${product.id}-${size}-${color}` }];
        });
        setIsOpen(true); // drawer khol do
    }, []);

    // Remove item
    const removeItem = useCallback((cartKey) => {
        setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
    }, []);

    // Update quantity
    const updateQty = useCallback((cartKey, qty) => {
        if (qty < 1) return;
        setItems((prev) =>
            prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity: qty } : i))
        );
    }, []);

    // Clear cart
    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, isOpen, setIsOpen,
            addItem, removeItem, updateQty, clearCart,
            totalItems, subtotal,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}