import { cookies } from "next/headers";
import { Topbar } from "@/components/admin/Topbar";
import { Card } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { EditProfileForm } from "@/components/admin/EditProfileForm";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import { User } from "@/models";

export const metadata = { title: "Settings" };

async function getCurrentUser() {
  const session = await auth();
  let userId: string | null = null;

  if (session?.user?.id) {
    userId = session.user.id;
  } else {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
      }
    } catch {}
  }

  if (!userId) return null;
  await connectDB();
  return User.findById(userId).select("firstName lastName email").lean();
}

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your admin account" />
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <Card className="max-w-xl">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Profile</h2>
          {user ? (
            <EditProfileForm profile={{ id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email }} />
          ) : (
            <p className="text-sm text-ink-muted">Could not load profile.</p>
          )}
        </Card>

        <Card className="max-w-xl">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Change password</h2>
          <ChangePasswordForm />
        </Card>
      </div>
    </>
  );
}
