/**
 * Escapes regex special characters so free-text search input can be safely
 * used inside a MongoDB `$regex` filter. Without this, a search term
 * containing characters like `(`, `)`, `.`, `*`, or `+` either throws a
 * regex compile error server-side (silently failing the whole query) or
 * matches in unintended ways.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
