import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ProductListing } from "@/components/product/ProductListing";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default function ProductsPage() {
  return (
    <Container>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing title="All Products" />
      </Suspense>
    </Container>
  );
}
