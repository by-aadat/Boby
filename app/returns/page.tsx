import { Container } from "@/components/ui/Container";
export default function ReturnsPage() {
  return (
    <Container className="py-10 max-w-2xl">
      <h1 className="font-heading font-semibold text-3xl mb-4">Return Policy</h1>
      <p className="text-sm text-km-muted leading-relaxed">
        Items can be returned within 7 days of delivery, unused and with original tags attached. Refunds are processed within 5-7 business days of the returned item passing quality check.
      </p>
    </Container>
  );
}
