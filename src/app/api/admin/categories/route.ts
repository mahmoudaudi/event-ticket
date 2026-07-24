import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import { getCategories } from "@/lib/admin/events";
import { withErrorLogging } from "@/lib/withErrorLogging";

export const GET = withErrorLogging(async () => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await getCategories();
  return NextResponse.json({ categories });
});

export const POST = withErrorLogging(async (request: Request) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  await connectDB();
  const category = await Category.create({ name: name.trim() });
  return NextResponse.json({ id: category._id.toString(), name: category.name }, { status: 201 });
});
