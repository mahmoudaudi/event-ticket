import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/signup" className="text-sm text-primary font-medium hover:underline mb-8 inline-block">&larr; Back</Link>
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-6">Privacy Policy</h1>
        <div className="text-sm text-on-surface-variant space-y-4 leading-relaxed">
          <p>Aurum respects your privacy. This policy explains how we collect, use, and protect your personal information.</p>
          <h2 className="text-lg font-semibold text-on-surface">1. Information We Collect</h2>
          <p>We collect your name, email address, and payment information when you create an account or make a purchase. We also collect usage data to improve our service.</p>
          <h2 className="text-lg font-semibold text-on-surface">2. How We Use Your Data</h2>
          <p>Your data is used to process transactions, send event confirmations, recommend events, and improve the platform. We never sell your data.</p>
          <h2 className="text-lg font-semibold text-on-surface">3. Data Security</h2>
          <p>We implement industry-standard security measures including encryption and secure servers to protect your information.</p>
          <h2 className="text-lg font-semibold text-on-surface">4. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
          <h2 className="text-lg font-semibold text-on-surface">5. Cookies</h2>
          <p>We use essential cookies for authentication and optional cookies for analytics. You can control cookie preferences in your browser settings.</p>
        </div>
        <p className="mt-8 text-xs text-outline">Last updated: July 2026</p>
      </div>
    </div>
  );
}
