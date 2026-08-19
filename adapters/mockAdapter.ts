import productsData from "@/mock/products.json";
import categoriesData from "@/mock/categories.json";
import brandsData from "@/mock/brands.json";
import bannersData from "@/mock/banners.json";
import reviewsData from "@/mock/reviews.json";
import settingsData from "@/mock/settings.json";
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

const products = productsData as Product[];
const categories = categoriesData as Category[];
const brands = brandsData as Brand[];
const banners = bannersData as Banner[];
const reviews = reviewsData as Review[];
const settings = settingsData as Settings;

const DELAY = 250;
function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY));
}

// Mock order "persistence" — real orders live in Google Sheets once the
// backend is connected (see sheetsAdapter.ts). In mock mode we keep orders
// in localStorage purely so the confirmation/order-history pages have
// something real to read back during local development and demos.
const MOCK_ORDERS_KEY = "kartme_mock_orders";

function readMockOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeMockOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

function generateMockOrderId(): string {
  const count = readMockOrders().length + 1;
  return `KM-2026-${String(count).padStart(6, "0")}`;
}

function applyFilters(list: Product[], filters: ProductFilters): Product[] {
  let out = list.filter((p) => p.status === "active");

  if (filters.category) {
    out = out.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }
  if (filters.subcategory) {
    out = out.filter(
      (p) => p.subcategory.toLowerCase() === filters.subcategory!.toLowerCase()
    );
  }
  if (filters.brand?.length) {
    out = out.filter((p) => filters.brand!.includes(p.brand));
  }
  if (filters.priceMin != null) {
    out = out.filter((p) => p.sellingPrice >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    out = out.filter((p) => p.sellingPrice <= filters.priceMax!);
  }
  if (filters.discountMin != null) {
    out = out.filter((p) => p.discountPercent >= filters.discountMin!);
  }
  if (filters.size?.length) {
    out = out.filter((p) =>
      p.variants.some((v) => filters.size!.includes(v.size))
    );
  }
  if (filters.color?.length) {
    out = out.filter((p) =>
      p.variants.some((v) => filters.color!.includes(v.color))
    );
  }
  if (filters.material?.length) {
    out = out.filter((p) => filters.material!.includes(p.material));
  }
  if (filters.rating != null) {
    out = out.filter((p) => p.rating >= filters.rating!);
  }
  if (filters.availability === "in_stock") {
    out = out.filter((p) => p.stock > 0);
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
    );
  }

  switch (filters.sort) {
    case "newest":
      out = [...out].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "price_asc":
      out = [...out].sort((a, b) => a.sellingPrice - b.sellingPrice);
      break;
    case "price_desc":
      out = [...out].sort((a, b) => b.sellingPrice - a.sellingPrice);
      break;
    case "rating":
      out = [...out].sort((a, b) => b.rating - a.rating);
      break;
    case "discount":
      out = [...out].sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    case "popularity":
      out = [...out].sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      break;
  }

  return out;
}

export const mockAdapter = {
  async getSettings(): Promise<Settings> {
    return wait(settings);
  },

  async getCategories(): Promise<Category[]> {
    return wait(categories.filter((c) => c.status === "active"));
  },

  async getBrands(): Promise<Brand[]> {
    return wait(brands);
  },

  async getBanners(): Promise<Banner[]> {
    return wait(banners.filter((b) => b.status === "active"));
  },

  async getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const filtered = applyFilters(products, filters);
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return wait({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  },

  async getProduct(slug: string): Promise<{
    product: Product | null;
    related: Product[];
  }> {
    const product = products.find((p) => p.slug === slug) ?? null;
    if (!product) return wait({ product: null, related: [] });
    const related = products
      .filter((p) => p.category === product.category && p.productId !== product.productId)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    return wait({ product, related });
  },

  async searchProducts(query: string, limit = 8): Promise<Product[]> {
    if (!query.trim()) return wait([]);
    const result = applyFilters(products, { query });
    return wait(result.slice(0, limit));
  },

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    return wait(reviews.filter((r) => r.productId === productId));
  },

  async getFeatured(): Promise<Product[]> {
    return wait(products.filter((p) => p.isFeatured && p.status === "active"));
  },

  async getBestsellers(): Promise<Product[]> {
    return wait(products.filter((p) => p.isBestseller && p.status === "active").slice(0, 8));
  },

  async getNewArrivals(): Promise<Product[]> {
    return wait(products.filter((p) => p.isNewArrival && p.status === "active").slice(0, 8));
  },

  async getFlashSale(): Promise<Product[]> {
    return wait(
      [...products]
        .filter((p) => p.discountPercent >= 40 && p.status === "active")
        .slice(0, 8)
    );
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // NOTE: this mock path does not actually validate or decrement stock —
    // it exists so the checkout UI has something real to submit to during
    // local development. Real stock-safe order creation (with LockService
    // and server-side price recalculation) lives in apps-script/Orders.gs
    // and runs once NEXT_PUBLIC_BACKEND_ENABLED=true.
    let subtotal = 0;
    let mrpTotal = 0;
    const items = input.items.map((i) => {
      const product = products.find((p) => p.productId === i.productId);
      const variant = product?.variants.find((v) => v.variantId === i.variantId);
      const price = variant?.price ?? product?.sellingPrice ?? 0;
      const mrp = product?.mrp ?? price;
      const total = price * i.quantity;
      subtotal += total;
      mrpTotal += mrp * i.quantity;
      return {
        productId: i.productId,
        variantId: i.variantId,
        sku: i.sku,
        name: i.name,
        image: i.image,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price,
        mrp,
        total,
      };
    });

    const discount = mrpTotal - subtotal;
    const tax = Math.round(subtotal * 0.05);
    const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;
    const grandTotal = subtotal + tax + shipping;

    const orderDate = new Date();
    const expectedDelivery = new Date(orderDate.getTime() + 5 * 86400000);

    const order: Order = {
      orderId: generateMockOrderId(),
      customerName: input.customerName,
      mobile: input.mobile,
      email: input.email,
      items,
      totalAmount: subtotal,
      discount,
      couponDiscount: 0,
      tax,
      shipping,
      grandTotal,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "Order Placed",
      shippingAddress: input.shippingAddress,
      trackingId: "",
      orderDate: orderDate.toISOString(),
      expectedDelivery: expectedDelivery.toISOString(),
    };

    const existing = readMockOrders();
    writeMockOrders([...existing, order]);

    return wait(order);
  },

  async getOrder(orderId: string): Promise<Order | null> {
    const order = readMockOrders().find((o) => o.orderId === orderId) ?? null;
    return wait(order);
  },

  async getOrdersByMobile(mobile: string): Promise<Order[]> {
    const orders = readMockOrders().filter((o) => o.mobile === mobile);
    return wait(orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; couponCode?: string; message?: string }> {
    // Mock mode: two hardcoded demo codes, since there's no persistent
    // coupon store without the real backend.
    const upper = code.trim().toUpperCase();
    if (upper === "KARTME200" && subtotal >= 999) {
      return wait({ valid: true, discount: 200, couponCode: upper });
    }
    if (upper === "WELCOME10") {
      return wait({ valid: true, discount: Math.round(subtotal * 0.1), couponCode: upper });
    }
    return wait({ valid: false, discount: 0, message: "Invalid or expired coupon code" });
  },
};
