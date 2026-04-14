import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
