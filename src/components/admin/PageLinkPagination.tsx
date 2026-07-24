import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PageLinkPaginationProps {
  /** Builds the href for a given page number, e.g. `(p) => \`/admin/logs?tab=login&page=${p}\`` */
  hrefForPage: (page: number) => string;
  page: number;
  totalPages: number;
  total: number;
  label: string;
}

/** Prev/next pagination built from real links (no client JS) — used by server-rendered list pages. */
export function PageLinkPagination({ hrefForPage, page, totalPages, total, label }: PageLinkPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-4 text-sm text-ink-muted">
      <span>
        Page {page} of {totalPages} · {total} total {label}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={hrefForPage(Math.max(1, page - 1))}
          className={cn("rounded-lg border border-border p-1.5", page <= 1 && "pointer-events-none opacity-40")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <Link
          href={hrefForPage(Math.min(totalPages, page + 1))}
          className={cn("rounded-lg border border-border p-1.5", page >= totalPages && "pointer-events-none opacity-40")}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
