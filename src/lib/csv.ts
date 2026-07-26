/**
 * Serializes rows of plain values into an RFC 4180-ish CSV string.
 * Wraps any field containing a comma, quote, or newline in quotes and
 * doubles internal quotes, which is enough for the admin export use case.
 */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escapeField = (value: string | number): string => {
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.map(escapeField).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeField).join(","));
  }
  return lines.join("\n");
}
