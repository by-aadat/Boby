type Tone = "success" | "warn" | "danger" | "orange" | "blue" | "muted";

const toneClasses: Record<Tone, string> = {
  success: "bg-green-50 text-km-success",
  warn: "bg-amber-50 text-km-warn",
  danger: "bg-red-50 text-km-danger",
  orange: "bg-km-orange text-white",
  blue: "bg-km-blue text-white",
  muted: "bg-km-bg-alt text-km-muted",
};

export function Badge({ tone = "muted", children, className = "" }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
