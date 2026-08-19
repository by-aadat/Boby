export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-km-line overflow-hidden">
      <div className="skeleton aspect-[4/5]" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[45%] sm:w-[220px] shrink-0">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function PDPSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="skeleton aspect-square rounded-xl" />
      <div className="space-y-3">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-7 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/4 rounded" />
        <div className="skeleton h-10 w-1/2 rounded" />
        <div className="skeleton h-24 w-full rounded" />
      </div>
    </div>
  );
}
