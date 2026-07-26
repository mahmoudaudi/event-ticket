import { Topbar } from "@/components/admin/Topbar";
import { TabBar } from "@/components/admin/TabBar";
import { AuditLogList } from "@/components/admin/AuditLogList";
import { PageLinkPagination } from "@/components/admin/PageLinkPagination";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getAdminActivityList } from "@/lib/admin/activity";
import { getLoginActivityList } from "@/lib/admin/logins";
import { getErrorLogs } from "@/lib/admin/logs";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Logs" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "admin", label: "Admin Actions" },
  { value: "login", label: "Login Activity" },
  { value: "errors", label: "Error Logs" },
];

const FAILURE_REASON_LABEL: Record<string, string> = {
  unknown_email: "No account with that email",
  invalid_password: "Incorrect password",
  account_suspended: "Account is suspended",
};

interface LogsPageProps {
  searchParams: Promise<{ tab?: string; page?: string }>;
}

export default async function AdminLogsPage({ searchParams }: LogsPageProps) {
  const { tab: tabParam, page: pageParam } = await searchParams;
  const tab = TABS.some((t) => t.value === tabParam) ? tabParam! : "admin";
  const page = Number(pageParam ?? "1");

  return (
    <>
      <Topbar title="Logs" subtitle="Admin actions, login activity, and application errors" />
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        <Card className="p-0">
          <TabBar tabs={TABS} active={tab} hrefForTab={(value) => `/admin/logs?tab=${value}`} />
          {tab === "admin" && <AdminActionsTab page={page} />}
          {tab === "login" && <LoginActivityTab page={page} />}
          {tab === "errors" && <ErrorLogsTab />}
        </Card>
      </div>
    </>
  );
}

async function AdminActionsTab({ page }: { page: number }) {
  const data = await getAdminActivityList(page);
  return (
    <>
      <AuditLogList
        items={data.items}
        emptyMessage="No admin activity recorded yet. Actions like confirming a booking or changing a user's role will show up here."
      />
      {data.items.length > 0 && (
        <PageLinkPagination
          hrefForPage={(p) => `/admin/logs?tab=admin&page=${p}`}
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          label="actions"
        />
      )}
    </>
  );
}

async function LoginActivityTab({ page }: { page: number }) {
  const data = await getLoginActivityList(page);

  if (data.items.length === 0) {
    return (
      <p className="p-6 sm:p-8 text-center text-sm text-ink-muted">
        No login attempts recorded yet. Every sign-in — successful or not — will show up here.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {data.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-6 py-4">
            <div>
              <p className="text-sm text-ink">
                {item.name ?? item.email}
                {item.role && <span className="ml-2 text-xs text-ink-muted">({item.role})</span>}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {item.email} · {formatDateTime(item.createdAt)}
              </p>
            </div>
            {item.success ? (
              <Badge variant="success">Success</Badge>
            ) : (
              <Badge variant="danger">{FAILURE_REASON_LABEL[item.reason ?? ""] ?? "Failed"}</Badge>
            )}
          </li>
        ))}
      </ul>
      <PageLinkPagination
        hrefForPage={(p) => `/admin/logs?tab=login&page=${p}`}
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        label="attempts"
      />
    </>
  );
}

async function ErrorLogsTab() {
  const entries = await getErrorLogs();

  if (entries.length === 0) {
    return (
      <p className="p-6 sm:p-8 text-center text-sm text-ink-muted">
        No errors logged yet — this list stays empty as long as the app keeps running cleanly.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry, i) => (
        <li key={i} className="px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-danger">{entry.message}</p>
            <span className="shrink-0 text-xs text-ink-muted">{formatDateTime(entry.timestamp)}</span>
          </div>
          {Boolean(entry.url || entry.method) && (
            <p className="mt-1 text-xs text-ink-muted">
              {String(entry.method ?? "")} {String(entry.url ?? "")}
            </p>
          )}
          {entry.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-semibold text-ink-muted hover:text-ink">
                Stack trace
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-cream-alt p-3 text-xs text-ink-muted">
                {String(entry.stack)}
              </pre>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}
