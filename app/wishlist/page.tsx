"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useWishlist } from "@/context/WishlistContext";
import { productRepo } from "@/repositories/productRepo";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    productRepo.getProducts({ pageSize: 500 }).then((res) => {
      setProducts(res.items.filter((p) => ids.includes(p.productId)));
    });
  }, [ids]);

  return (
    <Container className="py-6">
      <h1 className="font-heading font-semibold text-2xl mb-6">My Wishlist</h1>
      {products === null ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Save items you love so you can find them easily later."
          actionLabel="Continue Shopping"
          actionHref="/products"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
