import "server-only";
import { connectDB } from "@/lib/db";
import { Event, User } from "@/models";
import { escapeRegex } from "@/lib/regex";
import type { QuickSearchResult } from "@/types/admin";

const RESULT_LIMIT = 5;

/** Powers the topbar's "Search events or users" box. Matches by title / name / email. */
export async function getQuickSearchResults(query: string): Promise<QuickSearchResult> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return { events: [], users: [] };

  await connectDB();
  const term = escapeRegex(trimmed);
  const regex = { $regex: term, $options: "i" };

  const [events, users] = await Promise.all([
    Event.find({ title: regex }).sort({ createdAt: -1 }).limit(RESULT_LIMIT),
    User.find({ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] })
      .sort({ createdAt: -1 })
      .limit(RESULT_LIMIT),
  ]);

  return {
    events: events.map((e) => ({ id: e._id.toString(), title: e.title, status: e.status })),
    users: users.map((u) => ({ id: u._id.toString(), name: `${u.firstName} ${u.lastName}`, email: u.email })),
  };
}
