import Link from "next/link";

type Props = {
  variant?: "full" | "mark";
  theme?: "light" | "dark";
  className?: string;
};

export function Logo({ variant = "full", theme = "light", className = "" }: Props) {
  const blue = theme === "dark" ? "#FFFFFF" : "var(--km-blue)";
  const orange = "var(--km-orange)";

  return (
    <Link href="/" className={`inline-flex items-center gap-2 shrink-0 ${className}`} aria-label="KartME home">
      <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 15h10l6 40h48l8-30H30" stroke={blue} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="34" cy="80" r="7" fill={blue} />
        <circle cx="68" cy="80" r="7" fill={blue} />
        <path d="M42 40c0-8 6-14 14-14s14 6 14 14-6 14-14 14c8 0 14 6 14 6" stroke={orange} strokeWidth="6" strokeLinecap="round" fill="none" />
      </svg>
      {variant === "full" && (
        <span className="font-heading font-bold text-xl leading-none tracking-tight">
          <span style={{ color: blue }}>Kart</span>
          <span style={{ color: orange }}>ME</span>
        </span>
      )}
    </Link>
  );
}
