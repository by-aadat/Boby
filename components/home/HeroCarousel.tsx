"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/types";

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[index];

  return (
    <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] rounded-2xl overflow-hidden bg-km-bg-alt">
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 max-w-lg">
        <h2 className="font-heading font-bold text-white text-2xl sm:text-4xl leading-tight">
          {banner.title}
        </h2>
        <p className="text-white/90 text-sm sm:text-lg mt-2">{banner.subtitle}</p>
        <Link
          href={banner.buttonUrl}
          className="mt-4 inline-flex w-fit bg-km-orange hover:bg-km-orange-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {banner.buttonText}
        </Link>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
            aria-label="Previous banner"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            aria-label="Next banner"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
