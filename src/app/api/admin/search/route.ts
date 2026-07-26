import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getQuickSearchResults } from "@/lib/admin/search";
import { withErrorLogging } from "@/lib/withErrorLogging";

export const GET = withErrorLogging(async (request: Request) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const results = await getQuickSearchResults(query);
  return NextResponse.json(results);
});
