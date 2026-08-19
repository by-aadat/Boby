import { Container } from "@/components/ui/Container";
import { ProductDetail } from "@/components/product/ProductDetail";
import { productRepo } from "@/repositories/productRepo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await productRepo.getProduct(slug);
    if (!product) return { title: "Product Not Found | KartME" };
    return {
      title: product.seoTitle || `${product.name} | KartME`,
      description: product.seoDescription || product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.images[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return { title: "KartME" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let structuredData: object | null = null;
  try {
    const { product } = await productRepo.getProduct(slug);
    if (product) {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images,
        description: product.shortDescription,
        sku: product.sku,
        brand: { "@type": "Brand", name: product.brand },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: product.sellingPrice,
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
        aggregateRating:
          product.reviewCount > 0
            ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
            : undefined,
      };
    }
  } catch {
    // structured data is a progressive enhancement — page still renders without it
  }

  return (
    <Container>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ProductDetail slug={slug} />
    </Container>
  );
}
