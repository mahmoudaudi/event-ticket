import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { escapeRegex } from "@/lib/regex";
import { logAdminActivity, type AdminActivityAction } from "@/lib/admin/activity";
import type { AdminUserListItem, AdminUserListResponse } from "@/types/admin";

const PAGE_SIZE = 10;

export interface UserListParams {
  page?: number;
  search?: string;
}

/** Paginated, searchable user list with each customer's total booking count, for the admin Users table. */
export async function getAdminUsersList(params: UserListParams): Promise<AdminUserListResponse> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const match: Record<string, unknown> = {};
  if (params.search) {
    const term = escapeRegex(params.search);
    match.$or = [
      { firstName: { $regex: term, $options: "i" } },
      { lastName: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
    ];
  }

  const [rows, total] = await Promise.all([
    User.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * PAGE_SIZE },
      { $limit: PAGE_SIZE },
      { $lookup: { from: "bookings", localField: "_id", foreignField: "userId", as: "bookings" } },
      { $addFields: { bookingCount: { $size: "$bookings" } } },
      { $project: { bookings: 0, password: 0 } },
    ]),
    User.countDocuments(match),
  ]);

  const users: AdminUserListItem[] = rows.map((row) => ({
    id: row._id.toString(),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    bookingCount: row.bookingCount,
  }));

  return {
    users,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

/** Toggles a user's active flag or changes their role. Refuses to let an admin edit their own account. */
export async function updateAdminUser(
  id: string,
  admin: { id: string; name: string },
  updates: { role?: "USER" | "ADMIN"; isActive?: boolean }
) {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid user id");
  if (id === admin.id) throw new Error("You can't change your own account from this screen.");

  await connectDB();
  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!user) throw new Error("User not found");

  const targetName = `${user.firstName} ${user.lastName}`;

  if (updates.role) {
    await logAdminActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "USER_ROLE_CHANGED",
      message: `${admin.name} changed ${targetName}'s role to ${updates.role === "ADMIN" ? "Admin" : "User"}.`,
    });
  }

  if (updates.isActive !== undefined) {
    const action: AdminActivityAction = updates.isActive ? "USER_REACTIVATED" : "USER_SUSPENDED";
    await logAdminActivity({
      adminId: admin.id,
      adminName: admin.name,
      action,
      message: `${admin.name} ${updates.isActive ? "reactivated" : "suspended"} ${targetName}.`,
    });
  }
}
