import { Topbar } from "@/components/admin/Topbar";
import { UsersTable } from "@/components/admin/UsersTable";
import { getAdminUsersList } from "@/lib/admin/users";

export const metadata = { title: "Users" };
export const dynamic = "force-dynamic";

interface AdminUsersPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { search } = await searchParams;
  const initialData = await getAdminUsersList({ page: 1, search });

  return (
    <>
      <Topbar title="User Management" subtitle="View customers and manage roles or access" />
      <div className="p-8">
        <UsersTable initialData={initialData} initialSearch={search ?? ""} />
      </div>
    </>
  );
}
