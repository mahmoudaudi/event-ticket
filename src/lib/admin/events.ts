import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Event, TicketType, Booking, Category } from "@/models";
import { escapeRegex } from "@/lib/regex";
import type {
  AdminEventListItem,
  AdminEventListResponse,
  AdminEventDetail,
  AdminCategory,
} from "@/types/admin";

const PAGE_SIZE = 10;

export interface EventListParams {
  page?: number;
  search?: string;
  status?: string;
}

/** Paginated, searchable event list with capacity/revenue rollups, for the admin Events table. */
export async function getAdminEventsList(params: EventListParams): Promise<AdminEventListResponse> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const match: Record<string, unknown> = {};
  if (params.search) {
    match.title = { $regex: escapeRegex(params.search), $options: "i" };
  }
  if (params.status && params.status !== "ALL") {
    match.status = params.status;
  }

  const [rows, total, activeCount, draftCount, revenueAgg] = await Promise.all([
    Event.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * PAGE_SIZE },
      { $limit: PAGE_SIZE },
      { $lookup: { from: "tickettypes", localField: "_id", foreignField: "eventId", as: "ticketTypes" } },
      { $lookup: { from: "bookings", localField: "_id", foreignField: "eventId", as: "bookings" } },
      { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "category" } },
      {
        $addFields: {
          totalCapacity: { $sum: "$ticketTypes.capacity" },
          remainingCapacity: { $sum: "$ticketTypes.remainingSeats" },
          revenue: {
            $sum: {
              $map: {
                input: { $filter: { input: "$bookings", cond: { $eq: ["$$this.paymentStatus", "PAID"] } } },
                as: "b",
                in: "$$b.total",
              },
            },
          },
          category: { $arrayElemAt: ["$category", 0] },
        },
      },
      { $project: { ticketTypes: 0, bookings: 0 } },
    ]),
    Event.countDocuments(match),
    Event.countDocuments({ status: "PUBLISHED" }),
    Event.countDocuments({ status: "DRAFT" }),
    Booking.aggregate([
      { $match: { paymentStatus: "PAID" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const events: AdminEventListItem[] = rows.map((row) => ({
    id: row._id.toString(),
    title: row.title,
    venue: row.venue,
    city: row.city,
    categoryName: row.category?.name ?? "Uncategorized",
    eventDate: row.eventDate.toISOString(),
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status,
    bannerImage: row.bannerImage || undefined,
    totalCapacity: row.totalCapacity ?? 0,
    remainingCapacity: row.remainingCapacity ?? 0,
    revenue: row.revenue ?? 0,
  }));

  return {
    events,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
    summary: {
      activeCount,
      draftCount,
      totalRevenue: revenueAgg[0]?.total ?? 0,
    },
  };
}

/** Full event record plus its ticket types, for the edit form. */
export async function getAdminEventDetail(id: string): Promise<AdminEventDetail | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();

  const [event, ticketTypes] = await Promise.all([
    Event.findById(id),
    TicketType.find({ eventId: id }).sort({ createdAt: 1 }),
  ]);
  if (!event) return null;

  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description ?? "",
    categoryId: event.categoryId.toString(),
    venue: event.venue ?? "",
    address: event.address ?? "",
    city: event.city ?? "",
    eventDate: event.eventDate.toISOString().slice(0, 10),
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    organizer: event.organizer ?? "",
    bannerImage: event.bannerImage ?? "",
    images: event.images ?? [],
    status: event.status,
    isFeatured: event.isFeatured ?? false,
    ticketTypes: ticketTypes.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      description: t.description,
      price: t.price,
      capacity: t.capacity,
      remainingSeats: t.remainingSeats,
    })),
  };
}

export interface EventInput {
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
  bannerImage?: string;
  images?: string[];
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  isFeatured?: boolean;
}

export async function createAdminEvent(data: EventInput, createdBy: string) {
  await connectDB();
  const event = await Event.create({ ...data, createdBy });
  return event._id.toString();
}

export async function updateAdminEvent(id: string, data: EventInput) {
  await connectDB();
  await Event.findByIdAndUpdate(id, data);
}

export interface DeleteEventResult {
  success: boolean;
  /** Present only when success is false — the existing-bookings count that blocked deletion. */
  bookingCount?: number;
}

/**
 * Deletes an event, but only if nobody has booked it yet. A ticketing
 * platform must never let an event with real bookings disappear out from
 * under its ticket holders — that leaves them with a booking that points
 * at nothing (exactly the orphaned-reference bug this guard prevents).
 * Admins who need to call off an event with existing bookings should set
 * its status to CANCELLED instead, which keeps the booking history intact
 * and still visible to affected users.
 */
export async function deleteAdminEvent(id: string): Promise<DeleteEventResult> {
  await connectDB();

  const bookingCount = await Booking.countDocuments({ eventId: id });
  if (bookingCount > 0) {
    return { success: false, bookingCount };
  }

  await Promise.all([Event.findByIdAndDelete(id), TicketType.deleteMany({ eventId: id })]);
  return { success: true };
}

/** Clones an event and its ticket tiers as a new DRAFT, with fresh (unsold) capacity. */
export async function duplicateAdminEvent(id: string, createdBy: string): Promise<string | null> {
  await connectDB();
  const [original, ticketTypes] = await Promise.all([
    Event.findById(id),
    TicketType.find({ eventId: id }),
  ]);
  if (!original) return null;

  const copy = await Event.create({
    title: `${original.title} (Copy)`,
    description: original.description,
    categoryId: original.categoryId,
    venue: original.venue,
    address: original.address,
    city: original.city,
    eventDate: original.eventDate,
    startTime: original.startTime,
    endTime: original.endTime,
    organizer: original.organizer,
    bannerImage: original.bannerImage,
    images: original.images,
    status: "DRAFT",
    createdBy,
  });

  if (ticketTypes.length > 0) {
    await TicketType.insertMany(
      ticketTypes.map((t) => ({
        eventId: copy._id,
        name: t.name,
        description: t.description,
        price: t.price,
        capacity: t.capacity,
        remainingSeats: t.capacity, // fresh inventory, not a copy of tickets already sold
      }))
    );
  }

  return copy._id.toString();
}

export interface TicketTypeInput {
  name: string;
  description?: string;
  price: number;
  capacity: number;
}

export async function createTicketType(eventId: string, data: TicketTypeInput) {
  await connectDB();
  const ticketType = await TicketType.create({
    eventId,
    ...data,
    remainingSeats: data.capacity,
  });
  return ticketType._id.toString();
}

export async function updateTicketType(id: string, data: Partial<TicketTypeInput>) {
  await connectDB();
  const existing = await TicketType.findById(id);
  if (!existing) return;

  // Keep remainingSeats consistent if capacity changes (preserve tickets already sold).
  let remainingSeats = existing.remainingSeats;
  if (data.capacity !== undefined && data.capacity !== existing.capacity) {
    const sold = existing.capacity - existing.remainingSeats;
    remainingSeats = Math.max(0, data.capacity - sold);
  }

  await TicketType.findByIdAndUpdate(id, { ...data, remainingSeats });
}

export async function deleteTicketType(id: string) {
  await connectDB();
  await TicketType.findByIdAndDelete(id);
}

export async function getCategories(): Promise<AdminCategory[]> {
  await connectDB();
  const categories = await Category.find({}).sort({ name: 1 });
  return categories.map((c) => ({ id: c._id.toString(), name: c.name }));
}
