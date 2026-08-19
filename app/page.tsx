import { Container } from "@/components/ui/Container";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FlashSale } from "@/components/home/FlashSale";
import { ProductRail } from "@/components/product/ProductRail";
import { PromoBanner } from "@/components/home/PromoBanner";
import { BrandStrip } from "@/components/home/BrandStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { Newsletter } from "@/components/home/Newsletter";
import {
  productRepo,
  categoryRepo,
  brandRepo,
  bannerRepo,
  settingsRepo,
} from "@/repositories/productRepo";
import reviewsData from "@/mock/reviews.json";
import productsData from "@/mock/products.json";
import type { Review, Product } from "@/lib/types";

export const revalidate = 0;

const DEFAULT_SECTIONS = [
  { id: "hero", enabled: true },
  { id: "categories", enabled: true },
  { id: "flashSale", enabled: true },
  { id: "bestSellers", enabled: true },
  { id: "newArrivals", enabled: true },
  { id: "promoBanner", enabled: true },
  { id: "brandStrip", enabled: true },
  { id: "reviews", enabled: true },
  { id: "newsletter", enabled: true },
];

export default async function HomePage() {
  const [settings, banners, categories, brands, bestsellers, newArrivals, flashSale] = await Promise.all([
    settingsRepo.getSettings().catch(() => null),
    bannerRepo.getBanners(),
    categoryRepo.getCategories(),
    brandRepo.getBrands(),
    productRepo.getBestsellers(),
    productRepo.getNewArrivals(),
    productRepo.getFlashSale(),
  ]);

  const sections = settings?.homepageSections?.length ? settings.homepageSections : DEFAULT_SECTIONS;
  const isEnabled = (id: string) => sections.find((s) => s.id === id)?.enabled !== false;

  const sectionRenderers: Record<string, React.ReactNode> = {
    hero: <HeroCarousel banners={banners} />,
    categories: <CategoryTiles categories={categories} />,
    flashSale: <FlashSale products={flashSale} />,
    bestSellers: <ProductRail title="Best Sellers" products={bestsellers} viewAllHref="/products?tag=best-sellers" />,
    newArrivals: <ProductRail title="New Arrivals" products={newArrivals} viewAllHref="/products?tag=new-arrivals" />,
    promoBanner: <PromoBanner />,
    brandStrip: <BrandStrip brands={brands} />,
    reviews: <ReviewsSection reviews={reviewsData as Review[]} products={productsData as Product[]} />,
    newsletter: <Newsletter />,
  };

  return (
    <Container>
      <div className="pt-4">
        {sections
          .filter((s) => isEnabled(s.id) && sectionRenderers[s.id])
          .map((s) => (
            <div key={s.id}>{sectionRenderers[s.id]}</div>
          ))}
      </div>
    </Container>
  );
}
