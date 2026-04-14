import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed",
  secondary:
    "bg-white text-black border border-zinc-200 hover:border-zinc-400 disabled:text-zinc-400 disabled:border-zinc-200",
  ghost: "bg-transparent text-black hover:bg-zinc-100",
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
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
