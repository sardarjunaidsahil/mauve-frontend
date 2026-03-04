import api from "./api";

const productService = {

    // CollectionPage ke liye — filters support
    async getProducts({ category, subCategory, sortBy, minPrice, maxPrice, sizes, page = 1, limit = 20 } = {}) {
        const params = {};
        if (category) params.category = category;
        if (subCategory) params.subCategory = subCategory;
        if (sortBy) params.sortBy = sortBy;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sizes?.length) params.sizes = sizes.join(",");
        params.page = page;
        params.limit = limit;

        const res = await api.get("/products", { params });
        return res.data; // { products, total, page, pages }
    },

    // ProductPage ke liye
    async getProduct(slug) {
        const res = await api.get(`/products/${slug}`);
        return res.data.product;
    },

    // HomePage ke liye
    async getNewArrivals(limit = 8) {
        const res = await api.get("/products/new-arrivals", { params: { limit } });
        return res.data.products;
    },

    async getFeatured(limit = 8) {
        const res = await api.get("/products/featured", { params: { limit } });
        return res.data.products;
    },
};

export default productService;