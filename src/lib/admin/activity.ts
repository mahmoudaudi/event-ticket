import "server-only";
import { connectDB } from "@/lib/db";
import { AdminActivity } from "@/models";

const PAGE_SIZE = 20;

export type AdminActivityAction =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "USER_ROLE_CHANGED"
  | "USER_SUSPENDED"
  | "USER_REACTIVATED";

export interface LogActivityInput {
  adminId: string;
  adminName: string;
  action: AdminActivityAction;
  message: string;
}

/** Records an admin-initiated action. Never throws — a logging failure should not break the underlying action. */
export async function logAdminActivity(input: LogActivityInput): Promise<void> {
  try {
    await connectDB();
    await AdminActivity.create(input);
  } catch (error) {
    console.error("Failed to log admin activity:", error);
  }
}

export interface AdminActivityItem {
  id: string;
  adminName: string;
  action: AdminActivityAction;
  message: string;
  createdAt: string;
}

export interface AdminActivityListResponse {
  items: AdminActivityItem[];
  page: number;
  totalPages: number;
  total: number;
}

/** Paginated audit log for the /admin/logs page. Pass `actions` to scope it (e.g. booking-only entries). */
export async function getAdminActivityList(
  page: number,
  actions?: AdminActivityAction[]
): Promise<AdminActivityListResponse> {
  await connectDB();
  const currentPage = Math.max(1, page);
  const filter = actions && actions.length > 0 ? { action: { $in: actions } } : {};

  const [rows, total] = await Promise.all([
    AdminActivity.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    AdminActivity.countDocuments(filter),
  ]);

  return {
    items: rows.map((row) => ({
      id: row._id.toString(),
      adminName: row.adminName,
      action: row.action,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    })),
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

/** Booking-specific slice of the audit log (confirm/cancel actions only), for the Bookings page's Activity tab. */
export async function getBookingActivityList(page: number): Promise<AdminActivityListResponse> {
  return getAdminActivityList(page, ["BOOKING_CONFIRMED", "BOOKING_CANCELLED"]);
}
