import { z } from "zod";

export const eventInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().max(2000).default(""),
  categoryId: z.string().min(1, "Category is required"),
  venue: z.string().trim().min(1, "Venue is required").max(120),
  address: z.string().trim().max(200).default(""),
  city: z.string().trim().min(1, "City is required").max(80),
  eventDate: z.string().min(1, "Date is required"),
  startTime: z.string().trim().min(1, "Start time is required"),
  endTime: z.string().trim().min(1, "End time is required"),
  organizer: z.string().trim().max(120).default("Crescent Live Event Hall"),
  bannerImage: z.string().trim().max(500).optional().default(""),
  images: z.array(z.string()).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
});

export type EventInputPayload = z.infer<typeof eventInputSchema>;

export const ticketTypeInputSchema = z.object({
  name: z.string().trim().min(1, "Tier name is required").max(60),
  description: z.string().trim().max(300).optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
});

export type TicketTypeInputPayload = z.infer<typeof ticketTypeInputSchema>;
