import api from "@/lib/axios";
import { Product } from "@/types/product";

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    data: Product[];
  };
}

export const productService = {
  async getProducts() {
    const res = await api.get<ProductsResponse>(
      "/marketplace/products"
    );

    return res.data;
  },

  async getProduct(id: number) {
    const res = await api.get<ProductResponse>(
      `/marketplace/products/${id}`
    );

    return res.data;
  },

  async createProduct(data: Partial<Product>) {
    const res = await api.post<ProductResponse>(
      "/marketplace/products",
      data
    );

    return res.data;
  },

  async updateProduct(
    id: number,
    data: Partial<Product>
  ) {
    const res = await api.put<ProductResponse>(
      `/marketplace/products/${id}`,
      data
    );

    return res.data;
  },

  async deleteProduct(id: number) {
    return api.delete(
      `/marketplace/products/${id}`
    );
  },
  //getProduct: (id: number) => api.get<{ success: boolean; data: any }>(`/marketplace/products/${id}`),
};