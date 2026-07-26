import { redirect } from "next/navigation";

// Superseded by the consolidated /admin/logs page (Admin Actions / Login
// Activity / Error Logs tabs). Kept as a redirect so any existing links
// (e.g. bookmarks, the dashboard's old "View All Logs" button) still work.
export default function AdminActivityRedirect() {
  redirect("/admin/logs?tab=admin");
}
