import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getAdminUsersList } from "@/lib/admin/users";
import { withErrorLogging } from "@/lib/withErrorLogging";

export const GET = withErrorLogging(async (request: Request) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? undefined;

  const result = await getAdminUsersList({ page, search });
  return NextResponse.json(result);
});
