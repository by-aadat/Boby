import { mockAdapter } from "@/adapters/mockAdapter";
import { sheetsAdapter } from "@/adapters/sheetsAdapter";
import type { ProductFilters, CreateOrderInput } from "@/lib/types";

// Set NEXT_PUBLIC_BACKEND_ENABLED=true once your Google Sheets + Apps
// Script backend is deployed (see apps-script/README_APPSCRIPT.md).
// Until then, the site runs on realistic mock data with zero setup.
const useRealBackend = process.env.NEXT_PUBLIC_BACKEND_ENABLED === "true";
const adapter = useRealBackend ? sheetsAdapter : mockAdapter;

export const productRepo = {
  getProducts: (filters?: ProductFilters) => adapter.getProducts(filters),
  getProduct: (slug: string) => adapter.getProduct(slug),
  searchProducts: (query: string, limit?: number) => adapter.searchProducts(query, limit),
  getReviewsForProduct: (productId: string) => adapter.getReviewsForProduct(productId),
  getFeatured: () => adapter.getFeatured(),
  getBestsellers: () => adapter.getBestsellers(),
  getNewArrivals: () => adapter.getNewArrivals(),
  getFlashSale: () => adapter.getFlashSale(),
};

export const categoryRepo = {
  getCategories: () => adapter.getCategories(),
};

export const brandRepo = {
  getBrands: () => adapter.getBrands(),
};

export const bannerRepo = {
  getBanners: () => adapter.getBanners(),
};

export const settingsRepo = {
  getSettings: () => adapter.getSettings(),
};

export const orderRepo = {
  createOrder: (input: CreateOrderInput) => adapter.createOrder(input),
  getOrder: (orderId: string) => adapter.getOrder(orderId),
  getOrdersByMobile: (mobile: string) => adapter.getOrdersByMobile(mobile),
  validateCoupon: (code: string, subtotal: number) => adapter.validateCoupon(code, subtotal),
};
