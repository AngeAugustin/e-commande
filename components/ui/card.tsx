import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-surface p-4 shadow-[0_10px_40px_rgba(10,61,46,0.06)]",
        className,
      )}
      {...props}
    />
  );
}
