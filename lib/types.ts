export type ProductVariant = {
  variantId: string;
  productId: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  stock: number;
  image: string;
  status: "active" | "inactive";
};

export type Product = {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  images: string[];
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  taxPercent: number;
  stock: number;
  status: "active" | "inactive" | "deleted";
  tags: string[];
  material: string;
  rating: number;
  reviewCount: number;
  specifications: { label: string; value: string }[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
};

export type Category = {
  categoryId: string;
  name: string;
  slug: string;
  parentCategory: string | null;
  image: string;
  productCount: number;
  sortOrder: number;
  status: "active" | "inactive";
};

export type Brand = {
  brandId: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
};

export type Banner = {
  bannerId: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  buttonText: string;
  buttonUrl: string;
  sortOrder: number;
  status: "active" | "inactive";
};

export type Review = {
  reviewId: string;
  productId: string;
  customerName: string;
  rating: number;
  review: string;
  images: string[];
  date: string;
  verifiedPurchase: boolean;
};

export type CartItem = {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  price: number;
  mrp: number;
  quantity: number;
  maxStock: number;
};

export type Settings = {
  siteName: string;
  logo: string;
  favicon: string;
  contactNumber: string;
  email: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
  freeShippingThreshold: number;
  shippingCharge: number;
  lowStockThreshold: number;
  currency: string;
  metaTitle: string;
  metaDescription: string;
  homepageSections?: { id: string; enabled: boolean }[];
};

export type ProductFilters = {
  page?: number;
  pageSize?: number;
  category?: string;
  subcategory?: string;
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  discountMin?: number;
  size?: string[];
  color?: string[];
  material?: string[];
  rating?: number;
  availability?: "in_stock" | "all";
  sort?:
    | "relevance"
    | "popularity"
    | "newest"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "discount";
  query?: string;
};

export type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ShippingAddress = {
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
};

export type OrderItem = {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  mrp: number;
  total: number;
};

export type PaymentMethod = "cod" | "upi" | "online";

export const ORDER_STATUSES = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Return Approved",
  "Returned",
  "Refund Initiated",
  "Refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  orderId: string;
  customerName: string;
  mobile: string;
  email: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  couponDiscount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingId: string;
  orderDate: string;
  expectedDelivery: string;
};

export type CreateOrderInput = {
  customerName: string;
  mobile: string;
  email: string;
  items: {
    productId: string;
    variantId: string;
    sku: string;
    name: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  // Present only for the online-payment path. The server re-verifies this
  // signature itself before ever marking an order "paid" — a client can
  // never just claim payment succeeded.
  razorpayVerification?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };
};

export type CustomerProfile = {
  customerId: string;
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
  profileImage: string;
};

export type Address = {
  addressId: string;
  customerId: string;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
};

export type RegisterInput = {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  dob?: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type AdminProfile = {
  adminId: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "manager" | "staff";
  permissions?: string[];
};

export type DashboardStats = {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  statusBreakdown: Record<string, number>;
  recentOrders: {
    orderId: string;
    orderDate: string;
    grandTotal: number;
    orderStatus: string;
    paymentStatus: string;
  }[];
};

export type AdminOrderSummary = {
  orderId: string;
  orderDate: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
};

export type AdminCustomerSummary = {
  customerId: string;
  fullName: string;
  email: string;
  mobile: string;
  registrationDate: string;
  totalOrders: number;
  totalSpent: number;
  accountStatus: string;
};
