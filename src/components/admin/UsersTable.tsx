"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminUserListItem, AdminUserListResponse } from "@/types/admin";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/providers/ToastProvider";
import { useDebouncedFetch } from "@/hooks/useDebouncedFetch";

interface UsersTableProps {
  initialData: AdminUserListResponse;
  initialSearch?: string;
}

export function UsersTable({ initialData, initialSearch = "" }: UsersTableProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingSuspend, setPendingSuspend] = useState<AdminUserListItem | null>(null);

  const url = useMemo(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    return `/api/admin/users?${params.toString()}`;
  }, [search, page]);

  const { data, setData, isLoading } = useDebouncedFetch<AdminUserListResponse>(url, initialData, {
    onError: (message) => toast.error(message),
  });

  async function handleUpdate(id: string, updates: { role?: "USER" | "ADMIN"; isActive?: boolean }) {
    setUpdatingId(id);
    const user = data.users.find((u) => u.id === id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      }));
      const name = `${user?.firstName} ${user?.lastName}`;
      if (updates.role) toast.success(`${name} is now ${updates.role === "ADMIN" ? "an Admin" : "a User"}.`);
      if (updates.isActive !== undefined) {
        toast.success(`${name} was ${updates.isActive ? "reactivated" : "suspended"}.`);
      }
      router.refresh();
    } else {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? "Couldn't update that user. Please try again.");
    }
    setUpdatingId(null);
  }

  function handleActiveToggle(user: AdminUserListItem) {
    if (user.isActive) {
      // Suspending is the impactful direction — confirm before applying it.
      setPendingSuspend(user);
    } else {
      handleUpdate(user.id, { isActive: true });
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
        <h2 className="font-display text-lg font-bold text-ink">All Users</h2>
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-ink-muted sm:w-72"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Bookings</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className={isLoading ? "opacity-60 transition-opacity" : ""}>
            {data.users.map((user) => {
              const isSelf = session?.user?.id === user.id;
              return (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-cream-alt/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-ink-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 text-ink">{user.bookingCount}</td>
                  <td className="px-5 py-4">
                    <Select
                      value={user.role}
                      disabled={isSelf || updatingId === user.id}
                      onChange={(e) => handleUpdate(user.id, { role: e.target.value as "USER" | "ADMIN" })}
                      className="w-32 py-1.5 text-xs"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </Select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      disabled={isSelf || updatingId === user.id}
                      onClick={() => handleActiveToggle(user)}
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.users.length === 0 && <EmptyState searchTerm={search || undefined} />}
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-ink-muted">
        <span>
          Showing {data.users.length === 0 ? 0 : (data.page - 1) * 10 + 1}–
          {(data.page - 1) * 10 + data.users.length} of {data.total} users
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={data.page <= 1}
            aria-label="Previous page"
            className="rounded-lg border border-border p-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={data.page >= data.totalPages}
            aria-label="Next page"
            className="rounded-lg border border-border p-1.5 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={pendingSuspend !== null}
        onClose={() => setPendingSuspend(null)}
        onConfirm={() => {
          if (pendingSuspend) return handleUpdate(pendingSuspend.id, { isActive: false });
        }}
        title="Suspend this user?"
        description={`${pendingSuspend?.firstName} ${pendingSuspend?.lastName} will no longer be able to sign in or make bookings.`}
        confirmLabel="Suspend user"
      />
    </div>
  );
}
