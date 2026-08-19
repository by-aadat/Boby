import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <Container className="py-20 flex flex-col items-center text-center">
      <PackageX className="h-16 w-16 text-km-muted mb-4" />
      <h1 className="font-heading font-bold text-3xl mb-2">Oops! Page not found</h1>
      <p className="text-km-muted mb-6 max-w-sm">
        We couldn&apos;t find what you&apos;re looking for. It may have moved or no longer exists.
      </p>
      <Link href="/">
        <Button size="lg">Continue Shopping</Button>
      </Link>
    </Container>
  );
}
