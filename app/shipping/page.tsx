import { Container } from "@/components/ui/Container";
export default function ShippingPage() {
  return (
    <Container className="py-10 max-w-2xl">
      <h1 className="font-heading font-semibold text-3xl mb-4">Shipping Policy</h1>
      <p className="text-sm text-km-muted leading-relaxed">
        We deliver across India in 3-7 business days. Orders above ₹999 ship free; a flat ₹79 shipping fee applies below that threshold.
      </p>
    </Container>
  );
}
