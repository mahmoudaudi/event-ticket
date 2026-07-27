/**
 * Seeds the database with sample data so the admin dashboard, events table,
 * bookings table, and users table all have realistic content to display.
 *
 * Usage: npm run seed
 * (reads MONGODB_URI from .env.local)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
import {
  User,
  Category,
  Event,
  TicketType,
  Booking,
  PromoCode,
  Payment,
} from "../src/models";

/** Returns a Date offset by `days` from now (negative = past, positive = future). */
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/** Deterministic-ish random integer in [min, max]. */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB. Clearing existing collections...");

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Event.deleteMany({}),
    TicketType.deleteMany({}),
    Booking.deleteMany({}),
    PromoCode.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  // --- Users -----------------------------------------------------------
  const adminPassword = await hashPassword("Admin123!");
  const userPassword = await hashPassword("Password123!");

  const admin = await User.create({
    firstName: "Alex",
    lastName: "Rivera",
    email: "admin@crescentlive.com",
    password: adminPassword,
    phone: "555-010-0001",
    role: "ADMIN",
  });

  const customerNames = [
    ["Jane", "Doe"],
    ["Marcus", "Thorne"],
    ["Elena", "Lopez"],
    ["Sam", "Knight"],
    ["Priya", "Nair"],
    ["Omar", "Haddad"],
  ];
  const customers = await User.insertMany(
    customerNames.map(([firstName, lastName], i) => ({
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      password: userPassword,
      phone: `555-010-01${String(i + 1).padStart(2, "0")}`,
      role: "USER",
      createdAt: daysFromNow(-randomInt(1, 45)),
    }))
  );

  console.log(`Created ${customers.length + 1} users.`);

  // --- Categories --------------------------------------------------------
  const categories = await Category.insertMany([
    { name: "Concerts", description: "Live music performances" },
    { name: "Comedy", description: "Stand-up and improv shows" },
    { name: "Theater", description: "Plays and musical theater" },
    { name: "Classical", description: "Orchestra and chamber music" },
  ]);
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // --- Events + Ticket Types ----------------------------------------------
  const eventDefs = [
    {
      title: "Neon Horizon Tour",
      category: "Concerts",
      venue: "Crescent Main Hall",
      city: "Springfield",
      daysOut: 18,
      status: "PUBLISHED",
      tiers: [
        { name: "General Admission", price: 65, capacity: 300 },
        { name: "VIP", price: 150, capacity: 60 },
      ],
    },
    {
      title: "Midnight Symphony: Evening Gala",
      category: "Classical",
      venue: "Crescent Main Hall",
      city: "Springfield",
      daysOut: 34,
      status: "PUBLISHED",
      tiers: [
        { name: "Standard", price: 89, capacity: 200 },
        { name: "Premium Balcony", price: 149, capacity: 40 },
      ],
    },
    {
      title: "Stand-Up Spotlight: Live Night",
      category: "Comedy",
      venue: "Crescent Black Box",
      city: "Springfield",
      daysOut: 9,
      status: "PUBLISHED",
      tiers: [{ name: "General Admission", price: 35, capacity: 150 }],
    },
    {
      title: "Chamber Harmony: Vivaldi Reimagined",
      category: "Classical",
      venue: "Crescent Main Hall",
      city: "Springfield",
      daysOut: 52,
      status: "PUBLISHED",
      tiers: [{ name: "General Admission", price: 55, capacity: 220 }],
    },
    {
      title: "Modern Prometheus: A New Play",
      category: "Theater",
      venue: "Crescent Black Box",
      city: "Springfield",
      daysOut: 27,
      status: "PUBLISHED",
      tiers: [
        { name: "General Admission", price: 42, capacity: 120 },
        { name: "Front Row", price: 78, capacity: 24 },
      ],
    },
    {
      title: "Evening Jazz Gala",
      category: "Concerts",
      venue: "Crescent Lounge",
      city: "Springfield",
      daysOut: 41,
      status: "DRAFT",
      tiers: [{ name: "General Admission", price: 48, capacity: 90 }],
    },
    {
      title: "Gourmet Workshop",
      category: "Theater",
      venue: "Crescent Studio",
      city: "Springfield",
      daysOut: -12,
      status: "PUBLISHED",
      tiers: [{ name: "Workshop Seat", price: 75, capacity: 50 }],
    },
  ] as const;

  const events = [];
  const ticketTypesByEvent: Record<string, mongoose.Document[]> = {};

  for (const def of eventDefs) {
    const event = await Event.create({
      title: def.title,
      description:
        "Join us at Crescent Live Event Hall for an unforgettable night. Doors open one hour before showtime.",
      categoryId: categoryByName[def.category]._id,
      venue: def.venue,
      address: "120 Riverside Ave",
      city: def.city,
      eventDate: daysFromNow(def.daysOut),
      startTime: "8:00 PM",
      endTime: "10:30 PM",
      organizer: "Crescent Live Event Hall",
      bannerImage: "",
      images: [],
      status: def.status,
      createdBy: admin._id,
      createdAt: daysFromNow(-randomInt(5, 60)),
    });
    events.push(event);

    const tiers = [];
    for (const tier of def.tiers) {
      const sold = def.status === "PUBLISHED" ? randomInt(0, Math.floor(tier.capacity * 0.7)) : 0;
      const ticketType = await TicketType.create({
        eventId: event._id,
        name: tier.name,
        description: `${tier.name} access to ${def.title}`,
        price: tier.price,
        capacity: tier.capacity,
        remainingSeats: tier.capacity - sold,
      });
      tiers.push(ticketType);
    }
    ticketTypesByEvent[event._id.toString()] = tiers;
  }

  console.log(`Created ${events.length} events with ticket types.`);

  // --- Promo codes ---------------------------------------------------------
  await PromoCode.insertMany([
    {
      code: "WELCOME10",
      description: "10% off your first booking",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumPurchase: 0,
      maxUsage: 500,
      usedCount: 42,
      expiresAt: daysFromNow(90),
      isActive: true,
    },
    {
      code: "GALA25",
      description: "$25 off gala events",
      discountType: "FIXED",
      discountValue: 25,
      minimumPurchase: 100,
      maxUsage: 100,
      usedCount: 8,
      expiresAt: daysFromNow(30),
      isActive: true,
    },
  ]);

  // --- Bookings + Payments (spread over the last 30 days for the trend chart) --
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED");
  let bookingCounter = 1000;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const bookingsToday = randomInt(0, 4);
    for (let i = 0; i < bookingsToday; i++) {
      const event = publishedEvents[randomInt(0, publishedEvents.length - 1)];
      const tiers = ticketTypesByEvent[event._id.toString()];
      const tier = tiers[randomInt(0, tiers.length - 1)] as unknown as { _id: mongoose.Types.ObjectId; price: number };
      const customer = customers[randomInt(0, customers.length - 1)];
      const quantity = randomInt(1, 4);
      const subtotal = tier.price * quantity;
      const bookingStatusRoll = Math.random();
      const bookingStatus =
        bookingStatusRoll < 0.08 ? "CANCELLED" : bookingStatusRoll < 0.18 ? "PENDING" : "CONFIRMED";
      const paymentStatus = bookingStatus === "CONFIRMED" ? "PAID" : bookingStatus === "PENDING" ? "PENDING" : "FAILED";
      const createdAt = daysFromNow(-dayOffset);
      bookingCounter += 1;

      const booking = await Booking.create({
        bookingReference: `EP-${bookingCounter}`,
        userId: customer._id,
        eventId: event._id,
        tickets: [
          {
            ticketTypeId: tier._id,
            quantity,
            unitPrice: tier.price,
            totalPrice: subtotal,
          },
        ],
        subtotal,
        discount: 0,
        total: subtotal,
        paymentStatus,
        bookingStatus,
        qrCode: `QR-${bookingCounter}`,
        createdBy: customer._id,
        createdAt,
        updatedAt: createdAt,
      });

      if (paymentStatus === "PAID") {
        await Payment.create({
          bookingId: booking._id,
          paymentMethod: "MOCK",
          paymentStatus: "PAID",
          amount: subtotal,
          transactionReference: `TXN-${bookingCounter}`,
          paidAt: createdAt,
          createdAt,
        });
      }
    }
  }

  const totalBookings = await Booking.countDocuments();
  console.log(`Created ${totalBookings} bookings across the last 30 days.`);

  console.log("\nSeed complete.");
  console.log("Admin login -> email: admin@crescentlive.com | password: Admin123!");
  console.log("Sample user -> email: jane.doe@example.com | password: Password123!");
}

seed()
  .then(() => mongoose.connection.close())
  .catch((error) => {
    console.error("Seed failed:", error);
    mongoose.connection.close();
    process.exit(1);
  });
