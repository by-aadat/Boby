import type { MetadataRoute } from "next";
import { productRepo, categoryRepo } from "@/repositories/productRepo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kartme.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/shipping`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE_URL}/returns`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];

  try {
    const [categories, { items: products }] = await Promise.all([
      categoryRepo.getCategories(),
      productRepo.getProducts({ pageSize: 500 }),
    ]);

    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
      lastModified: p.createdAt,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch {
    // If the backend is unreachable at build time, still return static pages
    // rather than failing the whole sitemap.
    return staticPages;
  }
}
