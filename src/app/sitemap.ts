import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurum.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    await connectDB();
    const events = await Event.find({}).select("_id").lean();
    const eventPages = events.map((event: any) => ({
      url: `${siteUrl}/events/${event._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    return [...staticPages, ...eventPages];
  } catch {
    return staticPages;
  }
}
