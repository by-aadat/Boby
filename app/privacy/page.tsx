import { Container } from "@/components/ui/Container";
export default function PrivacyPage() {
  return (
    <Container className="py-10 max-w-2xl">
      <h1 className="font-heading font-semibold text-3xl mb-4">Privacy Policy</h1>
      <p className="text-sm text-km-muted leading-relaxed">
        KartME (operated by OmNettwear LLP) respects your privacy. We collect only the information necessary to process your orders and improve your shopping experience, and we never sell your personal data to third parties. Full policy details will be published here at launch.
      </p>
    </Container>
  );
}
