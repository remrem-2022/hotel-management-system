import { db } from "./db";
import { userService } from "./userService";
import { roomService } from "./roomService";
import { bookingService } from "./bookingService";
import type { CreateRoomInput, CreateBookingInput } from "@/models";

export const seedService = {
  async seedDatabase(): Promise<void> {
    // Check if already seeded
    const existingUsers = await db.users.count();
    if (existingUsers > 0) {
      return; // Already seeded
    }

    // Create default admin user
    await userService.createUser({
      email: "admin@example.com",
      password: "Admin123!",
      name: "Admin User",
      role: "admin",
    });

    // Create a staff user
    await userService.createUser({
      email: "staff@example.com",
      password: "Staff123!",
      name: "Staff User",
      role: "staff",
    });

    // Create sample rooms
    const roomsData: CreateRoomInput[] = [
      {
        roomNumber: "101",
        type: "Single",
        capacity: 1,
        pricePerNight: 100,
        status: "Available",
        amenities: ["WiFi", "TV", "Air Conditioning", "Bathroom", "Work Desk"],
        notes: "Cozy single room perfect for solo travelers",
      },
      {
        roomNumber: "102",
        type: "Single",
        capacity: 1,
        pricePerNight: 100,
        status: "Available",
        amenities: ["WiFi", "TV", "Air Conditioning", "Bathroom"],
      },
      {
        roomNumber: "201",
        type: "Double",
        capacity: 2,
        pricePerNight: 150,
        status: "Available",
        amenities: ["WiFi", "TV", "Air Conditioning", "Queen Bed", "Bathroom", "Mini Bar"],
        notes: "Spacious double room with queen bed",
      },
      {
        roomNumber: "202",
        type: "Double",
        capacity: 2,
        pricePerNight: 150,
        status: "Available",
        amenities: ["WiFi", "TV", "Air Conditioning", "Queen Bed", "Bathroom", "Balcony"],
      },
      {
        roomNumber: "203",
        type: "Double",
        capacity: 2,
        pricePerNight: 160,
        status: "Maintenance",
        amenities: ["WiFi", "TV", "Air Conditioning", "Queen Bed", "Bathroom", "Ocean View"],
        notes: "Under maintenance - AC repair",
      },
      {
        roomNumber: "301",
        type: "Suite",
        capacity: 4,
        pricePerNight: 300,
        status: "Available",
        amenities: [
          "WiFi",
          "TV",
          "Air Conditioning",
          "King Bed",
          "Bathroom",
          "Bathtub",
          "Mini Bar",
          "Room Service",
          "Ocean View",
          "Balcony",
        ],
        notes: "Luxury suite with ocean view",
      },
      {
        roomNumber: "302",
        type: "Suite",
        capacity: 4,
        pricePerNight: 300,
        status: "Available",
        amenities: [
          "WiFi",
          "TV",
          "Air Conditioning",
          "King Bed",
          "Bathroom",
          "Bathtub",
          "Mini Bar",
          "City View",
        ],
      },
      {
        roomNumber: "401",
        type: "Deluxe",
        capacity: 6,
        pricePerNight: 500,
        status: "Available",
        amenities: [
          "WiFi",
          "TV",
          "Air Conditioning",
          "King Bed",
          "Queen Bed",
          "Bathroom",
          "Bathtub",
          "Mini Bar",
          "Room Service",
          "Ocean View",
          "Balcony",
          "Safe",
          "Coffee Maker",
        ],
        notes: "Premium deluxe suite with panoramic ocean view",
      },
    ];

    const createdRooms = [];
    for (const roomData of roomsData) {
      const room = await roomService.createRoom(roomData);
      createdRooms.push(room);
    }

    // Create sample bookings
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingsData: CreateBookingInput[] = [
      {
        guestName: "John Smith",
        guestContact: "+1-555-0101",
        roomId: createdRooms[0].id, // Room 101
        checkInDate: today.getTime(),
        checkOutDate: today.getTime() + 3 * 24 * 60 * 60 * 1000,
        status: "Checked-in",
        paymentStatus: "Paid",
        paidAmount: 300,
        notes: "Early check-in requested",
      },
      {
        guestName: "Emily Johnson",
        guestContact: "+1-555-0102",
        roomId: createdRooms[2].id, // Room 201
        checkInDate: today.getTime() + 1 * 24 * 60 * 60 * 1000,
        checkOutDate: today.getTime() + 4 * 24 * 60 * 60 * 1000,
        status: "Reserved",
        paymentStatus: "Partial",
        paidAmount: 150,
        notes: "Honeymoon package",
      },
      {
        guestName: "Michael Brown",
        guestContact: "+1-555-0103",
        roomId: createdRooms[5].id, // Suite 301
        checkInDate: today.getTime() + 2 * 24 * 60 * 60 * 1000,
        checkOutDate: today.getTime() + 7 * 24 * 60 * 60 * 1000,
        status: "Reserved",
        paymentStatus: "Unpaid",
        paidAmount: 0,
        notes: "Business trip - invoice to company",
      },
      {
        guestName: "Sarah Davis",
        guestContact: "+1-555-0104",
        roomId: createdRooms[7].id, // Deluxe 401
        checkInDate: today.getTime() + 5 * 24 * 60 * 60 * 1000,
        checkOutDate: today.getTime() + 10 * 24 * 60 * 60 * 1000,
        status: "Reserved",
        paymentStatus: "Paid",
        paidAmount: 2500,
        notes: "Anniversary celebration - arrange flowers and champagne",
      },
    ];

    for (const bookingData of bookingsData) {
      await bookingService.createBooking(bookingData);
    }

    // Update room status for checked-in booking
    await roomService.updateRoom(createdRooms[0].id, { status: "Occupied" });
  },

  async isDatabaseSeeded(): Promise<boolean> {
    const userCount = await db.users.count();
    return userCount > 0;
  },
};
