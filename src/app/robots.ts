import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurum.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-otp"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
