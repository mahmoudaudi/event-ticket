import { redirect } from "next/navigation";

// Calendar is now a tab inside Bookings (Table / Calendar / Activity) rather
// than its own top-level page. Kept as a redirect so any existing links
// (bookmarks, the old sidebar entry) still land somewhere useful.
export default function AdminCalendarRedirect() {
  redirect("/admin/bookings?view=calendar");
}
