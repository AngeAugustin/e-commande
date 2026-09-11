import Link from "next/link";

import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  /** Lien serveur (ex. commandes). Sinon utiliser onPageChange. */
  hrefForPage?: (page: number) => string;
  onPageChange?: (page: number) => void;
};

function pageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  itemLabel,
  hrefForPage,
  onPageChange,
}: TablePaginationProps) {
  if (totalItems <= 0) return null;

  const numbers = pageNumbers(page, totalPages);

  function renderPageControl(n: number) {
    const isActive = n === page;
    const className = cn(
      "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition",
      isActive
        ? "border-palm bg-palm text-white"
        : "border-border bg-surface text-palm hover:border-palm/40",
    );

    if (hrefForPage) {
      return (
        <Link key={n} href={hrefForPage(n)} className={className} aria-current={isActive ? "page" : undefined}>
          {n}
        </Link>
      );
    }

    return (
      <button
        key={n}
        type="button"
        onClick={() => onPageChange?.(n)}
        className={className}
        aria-current={isActive ? "page" : undefined}
      >
        {n}
      </button>
    );
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const navBtnClass = (disabled: boolean) =>
    cn(
      "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
      disabled
        ? "cursor-not-allowed border-transparent text-ink-muted/60"
        : "border-border bg-surface text-palm hover:border-palm/40",
    );

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-muted">
        Page {page} sur {totalPages} ({totalItems} {itemLabel})
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {hrefForPage ? (
          prevDisabled ? (
            <span className={navBtnClass(true)}>Precedente</span>
          ) : (
            <Link href={hrefForPage(page - 1)} className={navBtnClass(false)}>
              Precedente
            </Link>
          )
        ) : (
          <button
            type="button"
            disabled={prevDisabled}
            onClick={() => onPageChange?.(page - 1)}
            className={navBtnClass(prevDisabled)}
          >
            Precedente
          </button>
        )}

        {numbers.map((n, index) => {
          const prev = numbers[index - 1];
          const showEllipsis = prev !== undefined && n - prev > 1;
          return (
            <span key={`wrap-${n}`} className="contents">
              {showEllipsis ? (
                <span className="px-1 text-sm text-ink-muted" aria-hidden>
                  …
                </span>
              ) : null}
              {renderPageControl(n)}
            </span>
          );
        })}

        {hrefForPage ? (
          nextDisabled ? (
            <span className={navBtnClass(true)}>Suivante</span>
          ) : (
            <Link href={hrefForPage(page + 1)} className={navBtnClass(false)}>
              Suivante
            </Link>
          )
        ) : (
          <button
            type="button"
            disabled={nextDisabled}
            onClick={() => onPageChange?.(page + 1)}
            className={navBtnClass(nextDisabled)}
          >
            Suivante
          </button>
        )}
      </div>
    </div>
  );
}
