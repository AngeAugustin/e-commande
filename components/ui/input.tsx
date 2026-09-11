import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-ink-muted/70 focus:border-palm focus:ring-2 focus:ring-palm/20",
        className,
      )}
      {...props}
    />
  );
}
