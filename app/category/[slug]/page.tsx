import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ProductListing } from "@/components/product/ProductListing";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return (
    <Container>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing category={name} title={name} />
      </Suspense>
    </Container>
  );
}
