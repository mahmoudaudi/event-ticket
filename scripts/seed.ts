import mongoose from "mongoose";
import { Category, User, Event, TicketType } from "../src/models";

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not set. Run with: npx tsx --env-file=.env.local scripts/seed.ts");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clean existing data
  await Promise.all([
    Category.deleteMany({}),
    User.deleteMany({ email: "admin@eventpremium.com" }),
    Event.deleteMany({}),
    TicketType.deleteMany({}),
  ]);
  console.log("Cleaned existing data");

  // Create categories
  const categories = await Category.insertMany([
    { name: "Tech", description: "Technology conferences and summits" },
    { name: "Music", description: "Live performances and concerts" },
    { name: "Art", description: "Exhibitions and gallery events" },
    { name: "Workshop", description: "Hands-on learning experiences" },
  ]);
  console.log("Created categories");

  // Create admin user
  const admin = await User.create({
    firstName: "Admin",
    lastName: "EventPremium",
    email: "admin@eventpremium.com",
    password: "seed-password-placeholder",
    role: "ADMIN",
    isActive: true,
  });
  console.log("Created admin user");

  // Create events
  const eventData = [
    {
      title: "Neon Horizon: Digital Art Expo",
      description: "Explore the intersection of physical and digital realms in this exclusive curated exhibition featuring world-class artists.",
      categoryId: categories[2]._id, // Art
      venue: "Modern Art Wing",
      address: "245 W 52nd St",
      city: "New York, NY",
      eventDate: new Date("2026-10-14"),
      startTime: "19:00",
      endTime: "23:00",
      organizer: "Digital Arts Collective",
      bannerImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800",
      status: "PUBLISHED" as const,
      createdBy: admin._id,
      tickets: [
        { name: "General Admission", price: 120, capacity: 200, remainingSeats: 150 },
        { name: "VIP", price: 250, capacity: 50, remainingSeats: 30 },
      ],
    },
    {
      title: "Venture Sky: Rooftop Mixer",
      description: "Connect with industry leaders and innovative founders at our signature networking evening atop the Sapphire Tower.",
      categoryId: categories[0]._id, // Tech
      venue: "Sapphire Tower Rooftop",
      address: "345 California St",
      city: "San Francisco, CA",
      eventDate: new Date("2026-10-16"),
      startTime: "18:30",
      endTime: "22:00",
      organizer: "Venture Network",
      bannerImage: "https://images.unsplash.com/photo-1519671480209-0e9e3f1c2b5e?w=800",
      status: "PUBLISHED" as const,
      createdBy: admin._id,
      tickets: [
        { name: "Standard", price: 250, capacity: 100, remainingSeats: 65 },
        { name: "Premium", price: 500, capacity: 30, remainingSeats: 12 },
      ],
    },
    {
      title: "Design Mastery Workshop",
      description: "Learn advanced UI principles and high-fidelity prototyping from leading creative directors at top global agencies.",
      categoryId: categories[3]._id, // Workshop
      venue: "Studio 45",
      address: "Torstraße 45",
      city: "Berlin",
      eventDate: new Date("2026-10-22"),
      startTime: "10:00",
      endTime: "17:00",
      organizer: "Design Masters Inc.",
      bannerImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
      status: "PUBLISHED" as const,
      createdBy: admin._id,
      tickets: [
        { name: "Workshop Pass", price: 45, capacity: 30, remainingSeats: 18 },
      ],
    },
    {
      title: "Chamber Harmony: Vivaldi Reimagined",
      description: "A breathtaking evening of classical excellence performed by world-renowned soloists in an acoustically perfect hall.",
      categoryId: categories[1]._id, // Music
      venue: "Grand Concert Hall",
      address: "87 Regent St",
      city: "London",
      eventDate: new Date("2026-10-28"),
      startTime: "20:00",
      endTime: "22:30",
      organizer: "London Philharmonic Society",
      bannerImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
      status: "PUBLISHED" as const,
      createdBy: admin._id,
      tickets: [
        { name: "Standard", price: 150, capacity: 300, remainingSeats: 200 },
        { name: "Premium", price: 350, capacity: 100, remainingSeats: 45 },
        { name: "Box Seat", price: 600, capacity: 20, remainingSeats: 5 },
      ],
    },
    {
      title: "Future of Intelligence 2024",
      description: "Global Tech Summit exploring AI, machine learning, and the next frontier of intelligent systems.",
      categoryId: categories[0]._id, // Tech
      venue: "Moscone Center",
      address: "747 Howard St",
      city: "San Francisco, CA",
      eventDate: new Date("2026-11-05"),
      startTime: "09:00",
      endTime: "18:00",
      organizer: "TechForward Inc.",
      bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      status: "PUBLISHED" as const,
      createdBy: admin._id,
      tickets: [
        { name: "Early Bird", price: 299, capacity: 500, remainingSeats: 320 },
        { name: "General", price: 499, capacity: 1000, remainingSeats: 600 },
      ],
    },
  ];

  for (const ev of eventData) {
    const { tickets, ...eventFields } = ev;
    const event = await Event.create(eventFields);
    await TicketType.insertMany(
      tickets.map((t) => ({ ...t, eventId: event._id }))
    );
    console.log(`Created event: ${event.title}`);
  }

  console.log("\nSeed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
