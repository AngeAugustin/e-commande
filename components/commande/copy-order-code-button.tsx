"use client";

import { useState } from "react";

type CopyOrderCodeButtonProps = {
  code: string;
};

export function CopyOrderCodeButton({ code }: CopyOrderCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copier le code de commande"
      title={copied ? "Code copie" : "Copier le code"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
    >
      {copied ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4 10-10" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      )}
    </button>
  );
}
