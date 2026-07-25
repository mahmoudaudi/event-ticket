import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ChatWidgetWrapper from "@/components/ChatWidgetWrapper";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurum.com";

export const metadata: Metadata = {
  title: {
    default: "Aurum | Discover Exceptional Experiences",
    template: "%s | Aurum",
  },
  description:
    "Access the most exclusive corporate galas, tech summits, and cultural performances with the world's most refined event platform.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Aurum",
    title: "Aurum | Discover Exceptional Experiences",
    description:
      "Access the most exclusive corporate galas, tech summits, and cultural performances with the world's most refined event platform.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurum | Discover Exceptional Experiences",
    description:
      "Access the most exclusive corporate galas, tech summits, and cultural performances with the world's most refined event platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Aurum",
              url: siteUrl,
              description: "Premium event ticket and reservation platform.",
              foundingDate: "2024",
            }),
          }}
        />
      </head>
      <body className="bg-background text-on-surface font-body antialiased selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
        <Providers>{children}</Providers>
        <ChatWidgetWrapper />
      </body>
    </html>
  );
}
