import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  if (!data) {
    return new NextResponse("Missing data parameter", { status: 400 });
  }

  const svg = await QRCode.toString(data, {
    type: "svg",
    margin: 1,
    color: { dark: "#1a1611", light: "#ffffff" },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
