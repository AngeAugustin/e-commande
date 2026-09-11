import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-chili text-white shadow-[0_4px_14px_rgba(224,69,26,0.35)] hover:bg-chili-hover disabled:bg-mist disabled:text-ink-muted disabled:shadow-none disabled:cursor-not-allowed",
  secondary:
    "bg-surface text-palm border border-border hover:border-palm-soft hover:bg-surface-muted disabled:text-ink-muted disabled:border-border",
  ghost: "bg-transparent text-palm hover:bg-palm/8",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
