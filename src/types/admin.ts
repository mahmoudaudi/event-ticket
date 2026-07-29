/** Response shape for GET /api/admin/stats */
export interface AdminStats {
  totalRevenue: number;
  totalRevenueTrend: number;
  activeEvents: number;
  activeEventsTrend: number;
  totalBookings: number;
  totalBookingsTrend: number;
  newUsers: number;
  newUsersTrend: number;
  bookingTrends: { date: string; count: number }[];
  recentActivity: RecentActivityItem[];
}

export type RecentActivityType = "booking" | "user" | "event" | "payment_failed";

export interface RecentActivityItem {
  id: string;
  type: RecentActivityType;
  message: string;
  createdAt: string;
}

/** Row shape for the admin Events table (GET /api/admin/events). */
export interface AdminEventListItem {
  id: string;
  title: string;
  venue: string;
  city: string;
  categoryName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  bannerImage?: string;
  totalCapacity: number;
  remainingCapacity: number;
  revenue: number;
}

export interface AdminEventListResponse {
  events: AdminEventListItem[];
  page: number;
  totalPages: number;
  total: number;
  summary: {
    activeCount: number;
    draftCount: number;
    totalRevenue: number;
  };
}

/** Row shape for the admin Bookings table (GET /api/admin/bookings). */
export interface AdminBookingListItem {
  id: string;
  bookingReference: string;
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventId: string;
  createdAt: string;
  total: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
}

export interface AdminBookingListResponse {
  bookings: AdminBookingListItem[];
  page: number;
  totalPages: number;
  total: number;
  summary: {
    pendingCount: number;
    confirmedTodayCount: number;
    cancelledCount: number;
    growthTrend: number;
  };
}

export type BookingDateRange = "7" | "30" | "90" | "ALL";

export interface AdminBookingDetail extends AdminBookingListItem {
  eventVenue: string;
  eventDate: string;
  tickets: { name: string; quantity: number; unitPrice: number; totalPrice: number }[];
  subtotal: number;
  discount: number;
  qrCode?: string;
}

/** Row shape for the admin Users table (GET /api/admin/users). */
export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  bookingCount: number;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  page: number;
  totalPages: number;
  total: number;
}

export interface AdminCategory {
  id: string;
  name: string;
}

export interface QuickSearchResult {
  events: { id: string; title: string; status: "DRAFT" | "PUBLISHED" | "CANCELLED" }[];
  users: { id: string; name: string; email: string }[];
}

export interface NotificationItem {
  id: string;
  message: string;
  createdAt: string;
}

export interface NotificationsResponse {
  count: number;
  items: NotificationItem[];
}

export interface AdminTicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  remainingSeats: number;
}

export interface AdminEventDetail {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  venue: string;
  address: string;
  city: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  organizer: string;
  bannerImage: string;
  images: string[];
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  isFeatured: boolean;
  lat?: number | null;
  lng?: number | null;
  ticketTypes: AdminTicketType[];
}
