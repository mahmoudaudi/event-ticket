import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Admin Sign in" };

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-extrabold text-brand">Admin Sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to manage events and bookings</p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </Card>
    </div>
  );
}
