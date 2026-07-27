"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Field";

const OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

/** Changes the `?range=` search param, which the dashboard Server Component reads to re-query stats. */
export function DateRangeSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "30";

  return (
    <Select
      value={current}
      onChange={(e) => router.push(`/admin?range=${e.target.value}`)}
      className="w-40"
      aria-label="Dashboard date range"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
