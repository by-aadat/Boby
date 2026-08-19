import { Container } from "@/components/ui/Container";
export default function TermsPage() {
  return (
    <Container className="py-10 max-w-2xl">
      <h1 className="font-heading font-semibold text-3xl mb-4">Terms & Conditions</h1>
      <p className="text-sm text-km-muted leading-relaxed">
        By using the KartME website, you agree to our terms of sale, return policy and acceptable use guidelines. Full terms will be published here at launch.
      </p>
    </Container>
  );
}
