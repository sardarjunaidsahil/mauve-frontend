import api from "./api";

const cartService = {

    async getCart() {
        const res = await api.get("/cart");
        return res.data; // { cartId, items }
    },

    async addItem(productId, size, color, quantity = 1) {
        const res = await api.post("/cart", { productId, size, color, quantity });
        return res.data.item;
    },

    async updateItem(itemId, quantity) {
        const res = await api.put(`/cart/${itemId}`, { quantity });
        return res.data.item;
    },

    async removeItem(itemId) {
        await api.delete(`/cart/${itemId}`);
    },

    async clearCart() {
        await api.delete("/cart");
    },
};

export default cartService;