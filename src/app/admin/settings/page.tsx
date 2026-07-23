import { Topbar } from "@/components/admin/Topbar";
import { Card } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { auth } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your admin account" />
      <div className="flex flex-col gap-6 p-8">
        <Card className="max-w-xl">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Profile</h2>
          <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <dt className="text-ink-muted">Name</dt>
            <dd className="text-ink">{session?.user?.name}</dd>
            <dt className="text-ink-muted">Email</dt>
            <dd className="text-ink">{session?.user?.email}</dd>
            <dt className="text-ink-muted">Role</dt>
            <dd className="text-ink">Lead Admin</dd>
          </dl>
        </Card>

        <Card className="max-w-xl">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Change password</h2>
          <ChangePasswordForm />
        </Card>
      </div>
    </>
  );
}
