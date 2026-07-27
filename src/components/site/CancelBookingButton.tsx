"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface CancelBookingButtonProps {
  bookingId: string;
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel reservation");
      }

      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="danger"
        icon={<XCircle className="h-4 w-4" />}
        onClick={() => setShowConfirm(true)}
      >
        Cancel Reservation
      </Button>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Cancel Reservation?">
        <p className="text-sm text-ink-muted">
          Are you sure you want to cancel this reservation? This action cannot be undone, and all reserved seats will be released.
        </p>
        <div className="mt-4 rounded-lg border border-warning-soft bg-warning-soft/10 p-3 text-sm text-warning">
          <strong>Same-day cancellation:</strong> If the event is today, a 50% cancellation fee applies and only half
          the amount will be refunded.
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-danger-soft bg-danger-soft/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>
            Keep Reservation
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={loading}>
            Confirm Cancellation
          </Button>
        </div>
      </Modal>
    </>
  );
}
