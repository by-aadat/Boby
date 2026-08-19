import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="h-16 w-16 rounded-full bg-km-bg-alt flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-km-muted" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-km-ink mb-1">{title}</h3>
      <p className="text-sm text-km-muted mb-6 max-w-sm">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
