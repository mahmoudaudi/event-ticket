import type { LucideIcon } from "lucide-react";
import { SearchX, Inbox } from "lucide-react";

interface EmptyStateProps {
  /** When set, renders a "no matches" state instead of a generic empty one. */
  searchTerm?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

/** Shown inside a table body (as a full-width row cell content) when there's nothing to display. */
export function EmptyState({ searchTerm, title, description, icon }: EmptyStateProps) {
  const isSearchMiss = Boolean(searchTerm);
  const Icon = icon ?? (isSearchMiss ? SearchX : Inbox);
  const resolvedTitle = title ?? (isSearchMiss ? `No results for "${searchTerm}"` : "Nothing here yet");
  const resolvedDescription =
    description ?? (isSearchMiss ? "Try a different search term or clear your filters." : undefined);

  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="h-8 w-8 text-ink-muted" />
      <p className="text-sm font-semibold text-ink">{resolvedTitle}</p>
      {resolvedDescription && <p className="max-w-xs text-sm text-ink-muted">{resolvedDescription}</p>}
    </div>
  );
}
