"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCurrency } from "@/lib/format";
import type { AdminTicketType } from "@/types/admin";
import { useToast } from "@/components/providers/ToastProvider";

interface TicketTypeManagerProps {
  eventId: string;
  initialTicketTypes: AdminTicketType[];
}

/** Lists an event's pricing tiers with inline capacity/price edits, delete, and an add-tier form. */
export function TicketTypeManager({ eventId, initialTicketTypes }: TicketTypeManagerProps) {
  const router = useRouter();
  const toast = useToast();
  const [ticketTypes, setTicketTypes] = useState(initialTicketTypes);
  const [showAddForm, setShowAddForm] = useState(initialTicketTypes.length === 0);
  const [newTier, setNewTier] = useState({ name: "", price: "", capacity: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminTicketType | null>(null);

  async function handleAddTier(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/ticket-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTier.name,
          price: Number(newTier.price),
          capacity: Number(newTier.capacity),
        }),
      });
      if (!res.ok) {
        setError("Couldn't add that tier. Check the values and try again.");
        toast.error("Couldn't add that tier. Check the values and try again.");
        return;
      }
      const { id } = await res.json();
      setTicketTypes((prev) => [
        ...prev,
        { id, name: newTier.name, price: Number(newTier.price), capacity: Number(newTier.capacity), remainingSeats: Number(newTier.capacity) },
      ]);
      setNewTier({ name: "", price: "", capacity: "" });
      setShowAddForm(false);
      toast.success(`"${newTier.name}" tier added.`);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(tier: AdminTicketType) {
    const res = await fetch(`/api/admin/ticket-types/${tier.id}`, { method: "DELETE" });
    if (res.ok) {
      setTicketTypes((prev) => prev.filter((t) => t.id !== tier.id));
      toast.success(`"${tier.name}" removed.`);
      router.refresh();
    } else {
      toast.error("Couldn't remove that tier. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {ticketTypes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {ticketTypes.map((tier) => {
            const sold = tier.capacity - tier.remainingSeats;
            return (
              <li
                key={tier.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{tier.name}</p>
                  <p className="text-xs text-ink-muted">
                    {formatCurrency(tier.price)} · {sold} / {tier.capacity} sold
                  </p>
                </div>
                <button
                  onClick={() => setPendingDelete(tier)}
                  aria-label={`Remove ${tier.name}`}
                  className="rounded-lg p-2 text-ink-muted hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {showAddForm ? (
        <form onSubmit={handleAddTier} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          {error && <p className="text-xs font-medium text-danger">{error}</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              placeholder="Tier name (e.g. VIP)"
              value={newTier.name}
              onChange={(e) => setNewTier((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={newTier.price}
              onChange={(e) => setNewTier((p) => ({ ...p, price: e.target.value }))}
              required
            />
            <Input
              type="number"
              min="1"
              placeholder="Capacity"
              value={newTier.capacity}
              onChange={(e) => setNewTier((p) => ({ ...p, capacity: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={isSaving}>
              Save tier
            </Button>
            {ticketTypes.length > 0 && (
              <Button type="button" size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddForm(true)}>
          Add ticket tier
        </Button>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) return handleDelete(pendingDelete);
        }}
        title="Remove this ticket tier?"
        description={`"${pendingDelete?.name}" will no longer be available for booking. This can't be undone.`}
        confirmLabel="Remove tier"
      />
    </div>
  );
}
