import "server-only";
import { connectDB } from "@/lib/db";
import { LoginActivity } from "@/models";

export type LoginFailureReason = "unknown_email" | "invalid_password" | "account_suspended";

interface LogLoginAttemptInput {
  email: string;
  success: boolean;
  userId?: string;
  name?: string;
  role?: "USER" | "ADMIN";
  reason?: LoginFailureReason;
}

/** Records every sign-in attempt (success or failure) for the login activity audit trail. Never throws. */
export async function logLoginAttempt(input: LogLoginAttemptInput): Promise<void> {
  try {
    await connectDB();
    await LoginActivity.create(input);
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}

export interface LoginActivityItem {
  id: string;
  email: string;
  name?: string;
  role?: "USER" | "ADMIN";
  success: boolean;
  reason?: string;
  createdAt: string;
}

export interface LoginActivityListResponse {
  items: LoginActivityItem[];
  page: number;
  totalPages: number;
  total: number;
}

const PAGE_SIZE = 20;

/** Paginated login attempt history for the admin Logs page. */
export async function getLoginActivityList(page: number): Promise<LoginActivityListResponse> {
  await connectDB();
  const currentPage = Math.max(1, page);

  const [rows, total] = await Promise.all([
    LoginActivity.find({})
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE),
    LoginActivity.countDocuments({}),
  ]);

  return {
    items: rows.map((row) => ({
      id: row._id.toString(),
      email: row.email,
      name: row.name,
      role: row.role,
      success: row.success,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    })),
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}
