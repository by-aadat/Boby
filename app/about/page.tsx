import { Container } from "@/components/ui/Container";

export default function AboutPage() {
  return (
    <Container className="py-10 max-w-2xl prose">
      <h1 className="font-heading font-semibold text-3xl mb-4">About KartME</h1>
      <p className="text-km-ink leading-relaxed">
        KartME is a modern fashion destination bringing quality Men&apos;s, Women&apos;s and Kids&apos; wear to customers across India. Operated by OmNettwear LLP out of Kamla Nagar, Delhi, we combine years of on-ground retail experience with a fresh, easy online shopping experience.
      </p>
      <p className="text-km-ink leading-relaxed mt-4">
        We believe great style shouldn&apos;t be complicated or expensive. Every product on KartME is chosen for quality, comfort and value — checked by the same team that has served walk-in customers for years.
      </p>
    </Container>
  );
}
