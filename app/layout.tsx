import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";

// NOTE: Google Fonts (Poppins/Inter) could not be fetched in this sandboxed
// build environment. The font-family CSS variables below fall back to a
// polished system-font stack that ships identically. On your own machine
// (with normal internet access) you can restore next/font/google — see
// README.md "Restoring Google Fonts" for the two-line swap.

export const metadata: Metadata = {
  title: "KartME — Fashion for Everyone",
  description:
    "Shop the latest Men's, Women's & Kids' fashion at KartME. Great prices, fast delivery across India.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <Header />
              <main className="min-h-[60vh]">{children}</main>
              <Footer />
              <MobileBottomNav />
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
