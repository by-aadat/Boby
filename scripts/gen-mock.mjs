import fs from "fs";

function slugify(t) {
  return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function pick(arr, i) { return arr[i % arr.length]; }
function seedImg(seed, w = 600, h = 750) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const categories = [
  { name: "Men", sub: ["Shirts", "T-Shirts", "Jeans", "Trousers", "Kurta"] },
  { name: "Women", sub: ["Kurtis", "Anarkali", "Sarees", "Tops", "Dresses", "Jeans"] },
  { name: "Kids", sub: ["T-Shirts", "Jeans", "Frocks", "Ethnic Sets"] },
  { name: "Accessories", sub: ["Belts", "Stoles", "Socks"] },
];

const brands = ["Urban Threads", "KamlaWeave", "Rohini Fab", "Delhi Denim", "Northline", "Meraki Casuals", "Zindagi Ethnic", "Chowk Street"];
const colors = [
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#F9FAFB" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Maroon", hex: "#7F1D1D" },
  { name: "Mustard", hex: "#D97706" },
  { name: "Olive", hex: "#4D7C0F" },
  { name: "Pink", hex: "#DB2777" },
  { name: "Sky Blue", hex: "#0EA5E9" },
];
const adultSizes = ["S", "M", "L", "XL", "XXL"];
const kidsSizes = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];

const productNames = {
  Shirts: ["Cotton Casual Shirt", "Formal Check Shirt", "Linen Summer Shirt", "Printed Slim Shirt"],
  "T-Shirts": ["Cotton Crew Neck Tee", "Polo Tee", "Graphic Print Tee", "Henley Tee"],
  Jeans: ["Slim Fit Jeans", "Straight Fit Jeans", "Distressed Jeans", "Jogger Jeans"],
  Trousers: ["Formal Trousers", "Chino Trousers", "Cargo Trousers"],
  Kurta: ["Cotton Kurta", "Festive Silk Kurta", "Kurta Pyjama Set"],
  Kurtis: ["A-Line Kurti", "Straight Kurti", "Printed Rayon Kurti"],
  Anarkali: ["Embroidered Anarkali Suit", "Georgette Anarkali Set"],
  Sarees: ["Banarasi Silk Saree", "Cotton Handloom Saree", "Printed Georgette Saree"],
  Tops: ["Casual Crop Top", "Off-Shoulder Top", "Peplum Top"],
  Dresses: ["Floral Maxi Dress", "A-Line Party Dress", "Wrap Dress"],
  "T-Shirts_kids": ["Kids Printed Tee", "Kids Cartoon Tee"],
  "Jeans_kids": ["Kids Slim Jeans", "Kids Cargo Jeans"],
  Frocks: ["Kids Party Frock", "Kids Cotton Frock"],
  "Ethnic Sets": ["Kids Kurta Pyjama", "Kids Sherwani Set"],
  Belts: ["Leather Formal Belt", "Casual Braided Belt"],
  Stoles: ["Printed Cotton Stole", "Silk Blend Stole"],
  Socks: ["Cotton Ankle Socks (Pack of 3)", "Formal Crew Socks"],
};

const materials = ["Cotton", "Cotton Blend", "Rayon", "Polyester", "Linen", "Denim", "Silk Blend", "Georgette"];
const tagsPool = ["casual", "formal", "festive", "trending", "summer", "office-wear", "party-wear", "daily-wear"];

let products = [];
let pid = 1;
let vid = 1;

for (const cat of categories) {
  for (const sub of cat.sub) {
    const key = cat.name === "Kids" && (sub === "T-Shirts" || sub === "Jeans") ? `${sub}_kids` : sub;
    const names = productNames[key] || productNames[sub] || [`${sub} Item`];
    const countPerSub = cat.name === "Accessories" ? 2 : 3;
    for (let i = 0; i < countPerSub; i++) {
      const baseName = pick(names, i);
      const brand = pick(brands, pid + i);
      const name = `${brand} ${baseName}`;
      const mrp = [499, 799, 999, 1299, 1599, 1999, 2499, 2999, 3499, 3999][ (pid * 3 + i) % 10 ];
      const discountPercent = [20, 25, 30, 35, 40, 45, 50, 55, 60][(pid + i) % 9];
      const sellingPrice = Math.round(mrp * (1 - discountPercent / 100) / 5) * 5;
      const material = pick(materials, pid + i);
      const isKidsAccessory = cat.name === "Kids" || cat.name === "Accessories";
      const sizes = cat.name === "Kids" ? kidsSizes : cat.name === "Accessories" ? ["Free Size"] : adultSizes;
      const productId = `PRD-${String(pid).padStart(6, "0")}`;
      const slug = slugify(`${name}-${pick(colors, pid).name}-${pid}`);
      const seed = `kartme-${pid}`;
      const images = [seedImg(seed + "-a"), seedImg(seed + "-b"), seedImg(seed + "-c")];

      const variants = [];
      const numColors = cat.name === "Accessories" ? 2 : 3;
      let totalStock = 0;
      for (let c = 0; c < numColors; c++) {
        const color = pick(colors, pid + c);
        for (let s = 0; s < sizes.length; s++) {
          const size = sizes[s];
          // make some out of stock / low stock for testing states
          let stock = (pid + c + s) % 11;
          if ((pid + c) % 7 === 0) stock = 0;
          totalStock += stock;
          variants.push({
            variantId: `VAR-${String(vid).padStart(6, "0")}`,
            productId,
            sku: `${productId}-${color.name.slice(0,2).toUpperCase()}-${size}`,
            color: color.name,
            colorHex: color.hex,
            size,
            price: sellingPrice,
            stock,
            image: seedImg(seed + "-" + color.name),
            status: "active",
          });
          vid++;
        }
      }

      const rating = Math.round((3 + ((pid * 7 + i) % 20) / 10) * 10) / 10;
      const reviewCount = (pid * 13 + i * 5) % 180 + 3;

      products.push({
        productId,
        sku: `${productId}-BASE`,
        slug,
        name,
        brand,
        category: cat.name,
        subcategory: sub,
        description: `${name} crafted from premium ${material.toLowerCase()}, designed for everyday comfort and a modern silhouette. Perfect for ${cat.name.toLowerCase()} wear with a focus on fit, finish and durability. Easy to maintain and built for the Indian climate.`,
        shortDescription: `${material} ${sub.toLowerCase()} with a comfortable, modern fit.`,
        images,
        mrp,
        sellingPrice,
        discountPercent,
        taxPercent: 5,
        stock: totalStock,
        status: "active",
        tags: [tagsPool[(pid + i) % tagsPool.length], tagsPool[(pid + i + 3) % tagsPool.length]],
        material,
        rating,
        reviewCount,
        specifications: [
          { label: "Material", value: material },
          { label: "Fit", value: cat.name === "Women" ? "Regular Fit" : "Slim Fit" },
          { label: "Pattern", value: i % 2 === 0 ? "Solid" : "Printed" },
          { label: "Wash Care", value: "Machine wash cold" },
          { label: "Country of Origin", value: "India" },
        ],
        variants,
        isFeatured: pid % 5 === 0,
        isBestseller: pid % 4 === 0,
        isNewArrival: pid % 6 === 0,
        seoTitle: `Buy ${name} Online | KartME`,
        seoDescription: `Shop ${name} at the best price on KartME. ${material} ${sub}, fast delivery across India.`,
        createdAt: new Date(Date.now() - pid * 86400000).toISOString(),
      });
      pid++;
    }
  }
}

const categoryList = categories.map((c, i) => ({
  categoryId: `CAT-${String(i + 1).padStart(4, "0")}`,
  name: c.name,
  slug: slugify(c.name),
  parentCategory: null,
  image: seedImg("cat-" + c.name, 400, 400),
  productCount: products.filter((p) => p.category === c.name).length,
  sortOrder: i + 1,
  status: "active",
}));

const brandList = [...new Set(products.map((p) => p.brand))].map((b, i) => ({
  brandId: `BRD-${String(i + 1).padStart(4, "0")}`,
  name: b,
  slug: slugify(b),
  logo: seedImg("brand-" + b, 200, 100),
  productCount: products.filter((p) => p.brand === b).length,
}));

const banners = [
  { bannerId: "BNR-0001", title: "Big Fashion Sale", subtitle: "Up to 60% OFF on Men's & Women's Wear", image: seedImg("banner-1", 1600, 500), mobileImage: seedImg("banner-1m", 800, 900), buttonText: "Shop Now", buttonUrl: "/products", sortOrder: 1, status: "active" },
  { bannerId: "BNR-0002", title: "New Season Ethnic", subtitle: "Fresh Anarkali & Kurti Collection", image: seedImg("banner-2", 1600, 500), mobileImage: seedImg("banner-2m", 800, 900), buttonText: "Explore Collection", buttonUrl: "/category/women", sortOrder: 2, status: "active" },
  { bannerId: "BNR-0003", title: "Kids Festive Wear", subtitle: "Sherwani & Ethnic Sets from ₹799", image: seedImg("banner-3", 1600, 500), mobileImage: seedImg("banner-3m", 800, 900), buttonText: "Shop Kids", buttonUrl: "/category/kids", sortOrder: 3, status: "active" },
];

const reviewers = ["Priya Sharma", "Rohit Verma", "Ananya Gupta", "Vikram Singh", "Neha Kapoor", "Arjun Mehta"];
const reviewTexts = [
  "Great quality fabric and perfect fit. Very happy with the purchase.",
  "Good value for money. Delivery was quick too.",
  "Color is exactly as shown in the picture. Recommended.",
  "Comfortable for daily wear, will buy again.",
  "Nice product but sizing runs slightly small.",
];
const reviews = [];
let rid = 1;
for (const p of products.slice(0, 20)) {
  const n = 1 + (rid % 2);
  for (let i = 0; i < n; i++) {
    reviews.push({
      reviewId: `REV-${String(rid).padStart(6, "0")}`,
      productId: p.productId,
      customerName: pick(reviewers, rid),
      rating: 4 + (rid % 2),
      review: pick(reviewTexts, rid),
      images: [],
      date: new Date(Date.now() - rid * 43200000).toISOString(),
      verifiedPurchase: rid % 3 !== 0,
    });
    rid++;
  }
}

const settings = {
  siteName: "KartME",
  logo: "/logo.png",
  favicon: "/favicon.ico",
  contactNumber: "+91 98765 43210",
  email: "support@kartme.in",
  address: "Kamla Nagar, Delhi - 110007",
  socialLinks: [
    { platform: "instagram", url: "https://instagram.com/kartme" },
    { platform: "facebook", url: "https://facebook.com/kartme" },
  ],
  freeShippingThreshold: 999,
  shippingCharge: 79,
  lowStockThreshold: 5,
  currency: "INR",
  metaTitle: "KartME — Fashion for Everyone",
  metaDescription: "Shop the latest Men's, Women's & Kids' fashion at KartME. Great prices, fast delivery across India.",
  homepageSections: [
    { id: "hero", enabled: true },
    { id: "categories", enabled: true },
    { id: "flashSale", enabled: true },
    { id: "bestSellers", enabled: true },
    { id: "newArrivals", enabled: true },
    { id: "promoBanner", enabled: true },
    { id: "brandStrip", enabled: true },
    { id: "reviews", enabled: true },
    { id: "newsletter", enabled: true },
  ],
};

fs.writeFileSync("mock/products.json", JSON.stringify(products, null, 2));
fs.writeFileSync("mock/categories.json", JSON.stringify(categoryList, null, 2));
fs.writeFileSync("mock/brands.json", JSON.stringify(brandList, null, 2));
fs.writeFileSync("mock/banners.json", JSON.stringify(banners, null, 2));
fs.writeFileSync("mock/reviews.json", JSON.stringify(reviews, null, 2));
fs.writeFileSync("mock/settings.json", JSON.stringify(settings, null, 2));

console.log(`Generated ${products.length} products, ${categoryList.length} categories, ${brandList.length} brands, ${reviews.length} reviews.`);
