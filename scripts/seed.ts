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
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { connectDB } from "../src/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
import { hashPassword } from "../src/lib/password";
import {
  User,
  Category,
  Event,
  TicketType,
  Booking,
  PromoCode,
  Payment,
  Seat,
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
  console.log("Connected to MongoDB.");

  await Promise.all([
    Category.deleteMany({}),
    Event.deleteMany({}),
    TicketType.deleteMany({}),
    Booking.deleteMany({}),
    PromoCode.deleteMany({}),
    Payment.deleteMany({}),
    Seat.deleteMany({}),
  ]);

  // --- Users (reuse existing) -----------------------------------------
  let admin = await User.findOne({ role: "ADMIN" });
  if (!admin) {
    console.log("No admin found. Creating one...");
    const pwd = await hashPassword("Admin123!");
    admin = await User.create({ firstName: "Alex", lastName: "Rivera", email: "admin@crescentlive.com", password: pwd, phone: "555-010-0001", role: "ADMIN" });
  }

  let customers = await User.find({ role: "USER" });
  if (customers.length === 0) {
    console.log("No users found. Creating sample users...");
    const userPassword = await hashPassword("Password123!");
    const names = [["Jane","Doe"],["Marcus","Thorne"],["Elena","Lopez"],["Sam","Knight"],["Priya","Nair"],["Omar","Haddad"]];
    customers = await User.insertMany(names.map(([fn, ln], i) => ({ firstName: fn, lastName: ln, email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`, password: userPassword, phone: `555-010-01${String(i+1).padStart(2,"0")}`, role: "USER", createdAt: daysFromNow(-randomInt(1,45)) })));
  }
  console.log(`Using ${customers.length} existing users.`);

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
      venue: "BIEL — Beirut International Exhibition & Leisure Center",
      city: "Beirut",
      address: "Emile Lahoud Highway, Furn El Chebak",
      lat: 33.8938, lng: 35.5018,
      daysOut: 18,
      status: "PUBLISHED",
      bannerImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      tiers: [
        { name: "General Admission", price: 65, capacity: 300 },
        { name: "VIP", price: 150, capacity: 60 },
      ],
    },
    {
      title: "Midnight Symphony: Evening Gala",
      category: "Classical",
      venue: "Emile Bustani Auditorium — Al Bustan Hotel",
      city: "Beit Mery",
      address: "Al Bustan Road, Beit Mery",
      lat: 33.8647, lng: 35.5833,
      daysOut: 34,
      status: "PUBLISHED",
      bannerImage: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&h=400&fit=crop",
      tiers: [
        { name: "Standard", price: 89, capacity: 200 },
        { name: "Premium Balcony", price: 149, capacity: 40 },
      ],
    },
    {
      title: "Stand-Up Spotlight: Live Night",
      category: "Comedy",
      venue: "Metro Al Madina",
      city: "Beirut",
      address: "Aresco Center, Clémenceau Street",
      lat: 33.8972, lng: 35.4813,
      daysOut: 9,
      status: "PUBLISHED",
      bannerImage: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=400&fit=crop",
      tiers: [{ name: "General Admission", price: 35, capacity: 150 }],
    },
    {
      title: "Chamber Harmony: Vivaldi Reimagined",
      category: "Classical",
      venue: "Byblos Ancient Port",
      city: "Jbeil",
      address: "Byblos Archaeological Site",
      lat: 34.1198, lng: 35.6478,
      daysOut: 52,
      status: "PUBLISHED",
      bannerImage: "https://images.unsplash.com/photo-1628793075628-7f3c7c1b6c5a?w=800&h=400&fit=crop",
      tiers: [{ name: "General Admission", price: 55, capacity: 220 }],
    },
    {
      title: "Modern Prometheus: A New Play",
      category: "Theater",
      venue: "Théâtre Le Monnot",
      city: "Beirut",
      address: "Rue de l'Université Saint-Joseph, Achrafieh",
      lat: 33.8889, lng: 35.5142,
      daysOut: 27,
      status: "PUBLISHED",
      bannerImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=400&fit=crop",
      tiers: [
        { name: "General Admission", price: 42, capacity: 120 },
        { name: "Front Row", price: 78, capacity: 24 },
      ],
    },
    {
      title: "Evening Jazz Gala",
      category: "Concerts",
      venue: "Zaitunay Bay",
      city: "Beirut",
      address: "Beirut Central District",
      lat: 33.8975, lng: 35.4825,
      daysOut: 41,
      status: "DRAFT",
      bannerImage: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=400&fit=crop",
      tiers: [{ name: "General Admission", price: 48, capacity: 90 }],
    },
    {
      title: "Gourmet Workshop",
      category: "Theater",
      venue: "Bier el-Hilo",
      city: "Zahle",
      address: "Zahle Old Town",
      lat: 33.8483, lng: 35.9077,
      daysOut: -12,
      status: "PUBLISHED",
      bannerImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
      tiers: [{ name: "Workshop Seat", price: 75, capacity: 50 }],
    },
  ];

  const events = [];
  const ticketTypesByEvent: Record<string, mongoose.Document[]> = {};

  for (const def of eventDefs) {
    const slug = def.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const bannerImage = def.bannerImage ?? `https://placehold.co/800x400/1a1a2e/e0e0e0?text=${encodeURIComponent(def.title)}`;
    const event = await Event.create({
      title: def.title,
      description:
        "Join us at Crescent Live Event Hall for an unforgettable night. Doors open one hour before showtime.",
      categoryId: categoryByName[def.category]._id,
      venue: def.venue,
      address: def.address ?? "120 Riverside Ave",
      city: def.city,
      lat: def.lat,
      lng: def.lng,
      eventDate: daysFromNow(def.daysOut),
      startTime: "8:00 PM",
      endTime: "10:30 PM",
      organizer: "Crescent Live Event Hall",
      bannerImage,
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

  // --- Seats for all published events --------
  const seatedEvents = events.filter((e) => e.status === "PUBLISHED");
  const sections = [
    { name: "Floor", rows: ["A", "B"], seatsPerRow: 6, price: 120 },
    { name: "Balcony", rows: ["C", "D"], seatsPerRow: 8, price: 65 },
  ];
  let seatCount = 0;
  for (const event of seatedEvents) {
    for (const section of sections) {
      for (const row of section.rows) {
        for (let seatNumber = 1; seatNumber <= section.seatsPerRow; seatNumber++) {
          const isReserved = Math.random() < 0.15;
          await Seat.create({
            eventId: event._id,
            section: section.name,
            row,
            seatNumber: String(seatNumber),
            status: isReserved ? "RESERVED" : "AVAILABLE",
            price: section.price,
          });
          seatCount += 1;
        }
      }
    }
  }
  console.log(`Created ${seatCount} seats across ${seatedEvents.length} events.`);

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
        qrCode: `EP-${bookingCounter}`,
        createdBy: customer._id,
        createdAt,
        updatedAt: createdAt,
      });

      booking.qrCode = `${BASE_URL}/bookings/${booking._id}`;
      await booking.save();

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
