"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/providers/ToastProvider";
import { Trash2, Plus } from "lucide-react";

interface SeatSection {
  name: string;
  rows: string;
  seatsPerRow: number;
  price: number;
}

interface SeatData {
  _id: string;
  section: string;
  row: string;
  seatNumber: string;
  status: string;
  price: number;
}

const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function SeatManager({ eventId }: { eventId: string }) {
  const toast = useToast();
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sections, setSections] = useState<SeatSection[]>([
    { name: "Floor", rows: "A-B", seatsPerRow: 6, price: 120 },
  ]);

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}/seats`)
      .then((r) => r.json())
      .then((d) => { setSeats(d.seats ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const updateSection = (index: number, field: keyof SeatSection, value: string | number) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSection = () => {
    setSections((prev) => [...prev, { name: "", rows: "", seatsPerRow: 6, price: 60 }]);
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const parseRows = (rowsStr: string): string[] => {
    const parts = rowsStr.split("-").map((s) => s.trim().toUpperCase());
    if (parts.length === 2) {
      const start = ROW_LABELS.indexOf(parts[0]);
      const end = ROW_LABELS.indexOf(parts[1]);
      if (start >= 0 && end >= start) {
        return ROW_LABELS.slice(start, end + 1).split("");
      }
    }
    return rowsStr.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  };

  const generateSeats = async () => {
    setGenerating(true);
    try {
      const payload = {
        sections: sections.map((s) => ({
          name: s.name,
          rows: parseRows(s.rows),
          seatsPerRow: s.seatsPerRow,
          price: s.price,
        })),
      };
      const res = await fetch(`/api/admin/events/${eventId}/seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error?.formErrors?.[0] || "Failed to generate seats");
        return;
      }
      const data = await res.json();
      toast.success(`Created ${data.count} seats`);
      // Refresh
      const refreshed = await fetch(`/api/admin/events/${eventId}/seats`);
      const d = await refreshed.json();
      setSeats(d.seats ?? []);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const clearSeats = async () => {
    if (!confirm("Remove all seats for this event?")) return;
    try {
      await fetch(`/api/admin/events/${eventId}/seats`, { method: "DELETE" });
      setSeats([]);
      toast.success("Seats cleared");
    } catch {
      toast.error("Failed to clear seats");
    }
  };

  const grouped = seats.reduce<Record<string, SeatData[]>>((acc, s) => {
    if (!acc[s.section]) acc[s.section] = [];
    acc[s.section].push(s);
    return acc;
  }, {});

  if (loading) {
    return <div className="animate-pulse h-20 bg-surface-container-highest rounded-lg" />;
  }

  return (
    <div className="space-y-5">
      {seats.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink">Current seats ({seats.length})</h3>
            <button onClick={clearSeats} className="text-xs text-danger hover:underline cursor-pointer">
              Clear all
            </button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {Object.entries(grouped).map(([section, sectionSeats]) => {
              const rowGroups = sectionSeats.reduce<Record<string, SeatData[]>>((acc, s) => {
                if (!acc[s.row]) acc[s.row] = [];
                acc[s.row].push(s);
                return acc;
              }, {});
              return (
                <div key={section} className="text-xs">
                  <p className="font-semibold text-ink mb-1">{section} — ${sectionSeats[0]?.price ?? 0}</p>
                  {Object.entries(rowGroups).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-1 text-ink-muted ml-2">
                      <span className="w-4 font-medium">{row}</span>
                      <div className="flex gap-0.5">
                        {rowSeats.map((s) => (
                          <span
                            key={s._id}
                            className={`w-5 h-5 flex items-center justify-center rounded text-[10px] ${
                              s.status === "AVAILABLE"
                                ? "bg-success-soft text-success"
                                : s.status === "BOOKED"
                                ? "bg-danger-soft text-danger"
                                : "bg-warning-soft text-warning"
                            }`}
                          >
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Generate seats</h3>
        {sections.map((section, i) => (
          <div key={i} className="flex items-end gap-3 flex-wrap">
            <FieldWrapper label="Section name" className="min-w-[120px]">
              <Input
                value={section.name}
                onChange={(e) => updateSection(i, "name", e.target.value)}
                placeholder="e.g. Floor"
              />
            </FieldWrapper>
            <FieldWrapper label="Rows" className="min-w-[100px]">
              <Input
                value={section.rows}
                onChange={(e) => updateSection(i, "rows", e.target.value)}
                placeholder="A-D or A,B,C"
              />
            </FieldWrapper>
            <FieldWrapper label="Per row" className="w-20">
              <Input
                type="number"
                min={1}
                value={section.seatsPerRow}
                onChange={(e) => updateSection(i, "seatsPerRow", Number(e.target.value))}
              />
            </FieldWrapper>
            <FieldWrapper label="Price $" className="w-24">
              <Input
                type="number"
                min={0}
                step={0.5}
                value={section.price}
                onChange={(e) => updateSection(i, "price", Number(e.target.value))}
              />
            </FieldWrapper>
            {sections.length > 1 && (
              <button onClick={() => removeSection(i)} className="mb-1 text-danger hover:text-danger/80 cursor-pointer p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addSection} className="flex items-center gap-1 text-xs text-brand font-medium hover:underline cursor-pointer">
          <Plus className="h-3 w-3" /> Add section
        </button>
      </div>

      <Button onClick={generateSeats} disabled={generating} className="w-full sm:w-auto">
        {generating ? "Generating..." : "Generate seats"}
      </Button>
    </div>
  );
}
