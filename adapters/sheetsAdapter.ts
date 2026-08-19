import type {
  Product,
  Category,
  Brand,
  Banner,
  Review,
  Settings,
  ProductFilters,
  PaginatedProducts,
  Order,
  CreateOrderInput,
} from "@/lib/types";

type Envelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errorCode: string };

/**
 * Calls a KartME Apps Script action.
 *
 * - On the server (Server Components, route handlers), this process
 *   already holds the secret safely — call Apps Script directly.
 * - In the browser, we never touch the secret — call our own
 *   /api/store route, which attaches it server-side.
 */
async function callAction<T>(action: string, payload: unknown = {}): Promise<T> {
  const isServer = typeof window === "undefined";

  let res: Response;
  if (isServer) {
    const url = process.env.APPS_SCRIPT_URL;
    const secret = process.env.API_SHARED_SECRET;
    if (!url || !secret) {
      throw new Error(
        "APPS_SCRIPT_URL / API_SHARED_SECRET not set. Copy .env.example to .env.local and fill them in."
      );
    }
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload, secret }),
      cache: "no-store",
    });
  } else {
    res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
  }

  const json: Envelope<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data;
}

export const sheetsAdapter = {
  async getSettings(): Promise<Settings> {
    return callAction<Settings>("getSettings");
  },
  async getCategories(): Promise<Category[]> {
    return callAction<Category[]>("getCategories");
  },
  async getBrands(): Promise<Brand[]> {
    return callAction<Brand[]>("getBrands");
  },
  async getBanners(): Promise<Banner[]> {
    return callAction<Banner[]>("getBanners");
  },
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    return callAction<PaginatedProducts>("getProducts", filters);
  },
  async getProduct(slug: string): Promise<{ product: Product | null; related: Product[] }> {
    return callAction("getProduct", { slug });
  },
  async searchProducts(query: string, limit = 8): Promise<Product[]> {
    return callAction<Product[]>("searchProducts", { query, limit });
  },
  async getReviewsForProduct(productId: string): Promise<Review[]> {
    return callAction<Review[]>("getReviewsForProduct", { productId });
  },
  async getFeatured(): Promise<Product[]> {
    return callAction<Product[]>("getFeatured");
  },
  async getBestsellers(): Promise<Product[]> {
    return callAction<Product[]>("getBestsellers");
  },
  async getNewArrivals(): Promise<Product[]> {
    return callAction<Product[]>("getNewArrivals");
  },
  async getFlashSale(): Promise<Product[]> {
    return callAction<Product[]>("getFlashSale");
  },
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Deliberately NOT routed through callAction()/generic proxy — order
    // creation with a "paid" status must be server-verified. See
    // app/api/orders/create/route.ts.
    const isServer = typeof window === "undefined";
    let res: Response;
    if (isServer) {
      throw new Error("createOrder must be called from the browser, not a server component.");
    }
    res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json: Envelope<Order> = await res.json();
    if (!json.success) throw new Error(json.message || "Could not place order");
    return json.data;
  },
  async getOrder(orderId: string): Promise<Order | null> {
    return callAction<Order | null>("getOrder", { orderId });
  },
  async getOrdersByMobile(mobile: string): Promise<Order[]> {
    return callAction<Order[]>("getOrdersByMobile", { mobile });
  },
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; couponCode?: string; message?: string }> {
    try {
      const data = await callAction<{ valid: boolean; discount: number; couponCode: string }>("validateCoupon", { code, subtotal });
      return { ...data, valid: true };
    } catch (err) {
      return { valid: false, discount: 0, message: err instanceof Error ? err.message : "Invalid coupon" };
    }
  },
};
