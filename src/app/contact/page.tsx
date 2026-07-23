import Link from "next/link";

export default function ContactPage() {
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
        <h1 className="text-4xl font-bold font-headline text-on-surface mb-4">Contact us</h1>
        <p className="text-sm text-on-surface-variant mb-8 max-w-2xl">Have a question, feedback, or partnership idea? We&apos;d love to hear from you.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          <div className="bg-white rounded-2xl p-6 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-3xl mb-3">mail</span>
            <h3 className="text-lg font-semibold font-headline text-on-surface mb-1">Email</h3>
            <p className="text-sm text-on-surface-variant">hello@eventpremium.com</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-3xl mb-3">chat</span>
            <h3 className="text-lg font-semibold font-headline text-on-surface mb-1">Live Chat</h3>
            <p className="text-sm text-on-surface-variant">Available Mon–Fri, 9 AM – 6 PM EST</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-8 text-center text-sm text-on-surface-variant">
        &copy; 2026 Aurum. All rights reserved.
      </footer>
    </div>
  );
}
