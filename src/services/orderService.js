import api from "./api";

const orderService = {

    async createOrder({ items, pricing, address, paymentMethod = "cod", notes }) {
        const res = await api.post("/orders", { items, pricing, address, paymentMethod, notes });
        return res.data.order;
    },

    async getMyOrders() {
        const res = await api.get("/orders");
        return res.data.orders;
    },

    async getOrder(id) {
        const res = await api.get(`/orders/${id}`);
        return res.data.order;
    },
};

export default orderService;