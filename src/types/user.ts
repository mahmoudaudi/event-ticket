export interface UserBookingListItem {
  id: string;
  bookingReference: string;
  eventTitle: string;
  eventBannerImage?: string;
  eventVenue: string;
  eventCity: string;
  eventDate: string;
  startTime: string;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  total: number;
  ticketSummary: string; // e.g. "2x General Admission, 1x VIP"
  isUpcoming: boolean;
}

export type BookingDetailResult =
  | { status: "ok"; booking: UserBookingDetail }
  | { status: "not_found" }
  | { status: "event_removed"; bookingReference: string; createdAt: string };

export interface UserBookingDetail {
  id: string;
  bookingReference: string;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  event: {
    id: string;
    title: string;
    bannerImage?: string;
    categoryName?: string;
    venue: string;
    address: string;
    city: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    organizer: string;
  };
  tickets: { name: string; quantity: number; unitPrice: number; totalPrice: number }[];
  /**
   * Present only once a reservation-to-booking link exists for seat-based
   * events (see ReservedSeat model). Until then this is always empty and
   * the ticket-tier list above is the sole source of truth for what was
   * purchased — this field just means the e-ticket UI won't need a rewrite
   * once that plumbing lands.
   */
  seats: { section: string; row: string; seatNumber: string }[];
  subtotal: number;
  discount: number;
  total: number;
  qrCode: string;
  holderName: string;
  holderEmail: string;
}
