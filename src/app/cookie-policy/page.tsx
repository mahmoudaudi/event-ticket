import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-20 flex items-center border-b border-outline-variant/30 bg-surface">
        <div className="w-full px-[16px] md:px-[40px] max-w-[1280px] mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-display font-extrabold tracking-tight text-primary">Aurum</Link>
          <Link href="/login" className="text-sm text-on-surface-variant hover:text-primary font-medium transition-colors">Sign in</Link>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-[16px] md:px-[40px] py-16">
        <Link href="/" className="text-sm text-primary font-medium hover:underline mb-8 inline-block">&larr; Back</Link>
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-6">Cookie Policy</h1>
        <div className="text-sm text-on-surface-variant space-y-4 leading-relaxed max-w-3xl">
          <p>Aurum uses cookies to enhance your browsing experience, analyze site traffic, and personalize content.</p>
          <h2 className="text-lg font-semibold text-on-surface">What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
          <h2 className="text-lg font-semibold text-on-surface">How We Use Cookies</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Essential</strong> — Required for authentication and basic site functionality.</li>
            <li><strong>Analytics</strong> — Help us understand how visitors interact with the site.</li>
            <li><strong>Preferences</strong> — Remember your settings and preferences.</li>
          </ul>
          <h2 className="text-lg font-semibold text-on-surface">Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Disabling certain cookies may affect site functionality.</p>
        </div>
        <p className="mt-8 text-xs text-outline">Last updated: July 2026</p>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center text-sm text-on-surface-variant">
        &copy; 2026 Aurum. All rights reserved.
      </footer>
    </div>
  );
}
