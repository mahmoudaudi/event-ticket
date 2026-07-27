"use client";

import { useEffect, useState } from "react";
import { Plus, Percent, DollarSign, Calendar, Eye, EyeOff, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Promo {
  _id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minimumPurchase?: number;
  maxUsage?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

const defaultForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: 0,
  minimumPurchase: 0,
  maxUsage: 0,
  expiresAt: "",
  isActive: true,
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      if (res.ok) setPromos(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (p: Promo) => {
    setEditing(p);
    setForm({
      code: p.code,
      description: p.description || "",
      discountType: p.discountType,
      discountValue: p.discountValue,
      minimumPurchase: p.minimumPurchase || 0,
      maxUsage: p.maxUsage || 0,
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return;
    setSaving(true);

    const body: Record<string, unknown> = {
      ...form,
      minimumPurchase: form.minimumPurchase > 0 ? form.minimumPurchase : undefined,
      maxUsage: form.maxUsage > 0 ? form.maxUsage : undefined,
      expiresAt: form.expiresAt || null,
    };

    const url = editing ? `/api/admin/promos/${editing._id}` : "/api/admin/promos";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      setShowModal(false);
      fetchPromos();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to save promo code");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    const res = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    if (res.ok) fetchPromos();
  };

  const toggleActive = async (p: Promo) => {
    await fetch(`/api/admin/promos/${p._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchPromos();
  };

  if (loading) return <div className="p-6 text-ink-muted">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Promo Codes</h1>
          <p className="mt-1 text-sm text-ink-muted">Create and manage discount codes for your events.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          New Promo Code
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        {promos.length === 0 ? (
          <div className="p-12 text-center text-ink-muted">
            <Tag className="mx-auto mb-3 h-8 w-8" />
            <p>No promo codes yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {promos.map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-ink">{p.code}</span>
                    {p.isActive ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Active</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Disabled</span>
                    )}
                  </div>
                  {p.description && <p className="mt-0.5 text-sm text-ink-muted">{p.description}</p>}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      {p.discountType === "PERCENTAGE" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                      {p.discountType === "PERCENTAGE" ? `${p.discountValue}% off` : `$${p.discountValue} off`}
                    </span>
                    {p.minimumPurchase && (
                      <span>Min: ${p.minimumPurchase}</span>
                    )}
                    {p.maxUsage && (
                      <span>Used: {p.usedCount}/{p.maxUsage}</span>
                    )}
                    {p.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires {new Date(p.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(p)} className="rounded-lg p-2 text-ink-muted hover:bg-cream-alt" title={p.isActive ? "Disable" : "Enable"}>
                    {p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-ink-muted hover:bg-cream-alt" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="rounded-lg p-2 text-danger hover:bg-danger-soft" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Promo Code" : "New Promo Code"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-mono outline-none focus:border-brand"
              placeholder="SUMMER20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
              placeholder="20% off summer events"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENTAGE" | "FIXED" })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Value</label>
              <input
                type="number"
                min={0}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Min Purchase (optional)</label>
              <input
                type="number"
                min={0}
                value={form.minimumPurchase}
                onChange={(e) => setForm({ ...form, minimumPurchase: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="0 = no minimum"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Max Uses (optional)</label>
              <input
                type="number"
                min={0}
                value={form.maxUsage}
                onChange={(e) => setForm({ ...form, maxUsage: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="0 = unlimited"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Expires At (optional)</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            <label htmlFor="isActive" className="text-sm text-ink">Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving} disabled={!form.code.trim()}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
