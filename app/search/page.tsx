import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ProductListing } from "@/components/product/ProductListing";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <Container>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing query={q} title={q ? `Results for "${q}"` : "Search"} />
      </Suspense>
    </Container>
  );
}
