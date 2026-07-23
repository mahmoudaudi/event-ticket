import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/signup" className="text-sm text-primary font-medium hover:underline mb-8 inline-block">&larr; Back</Link>
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-6">Terms of Service</h1>
        <div className="text-sm text-on-surface-variant space-y-4 leading-relaxed">
          <p>These Terms of Service govern your use of EventPremium. By creating an account, you agree to these terms.</p>
          <h2 className="text-lg font-semibold text-on-surface">1. Account</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
          <h2 className="text-lg font-semibold text-on-surface">2. Events &amp; Tickets</h2>
          <p>EventPremium facilitates ticket purchases. All transactions are between the attendee and the event organizer. Refund policies are set by each organizer.</p>
          <h2 className="text-lg font-semibold text-on-surface">3. Prohibited Conduct</h2>
          <p>You may not use the platform for any unlawful purpose, resell tickets at inflated prices, or engage in any activity that disrupts events.</p>
          <h2 className="text-lg font-semibold text-on-surface">4. Limitation of Liability</h2>
          <p>EventPremium is not liable for any damages arising from your use of the platform or attendance at events listed on the platform.</p>
          <h2 className="text-lg font-semibold text-on-surface">5. Changes</h2>
          <p>We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>
        </div>
        <p className="mt-8 text-xs text-outline">Last updated: July 2026</p>
      </div>
    </div>
  );
}
