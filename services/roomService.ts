import { db } from "./db";
import type { Room, CreateRoomInput, UpdateRoomInput, RoomStatus, RoomType } from "@/models";
import { v4 as uuidv4 } from "@/utils/uuid";

export const roomService = {
  async createRoom(input: CreateRoomInput): Promise<Room> {
    // Check if room number already exists
    const existingRoom = await db.rooms
      .where("roomNumber")
      .equals(input.roomNumber)
      .first();

    if (existingRoom) {
      throw new Error("Room with this number already exists");
    }

    const now = Date.now();

    const room: Room = {
      id: uuidv4(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    await db.rooms.add(room);
    return room;
  },

  async getRoomById(id: string): Promise<Room | undefined> {
    return await db.rooms.get(id);
  },

  async getAllRooms(): Promise<Room[]> {
    return await db.rooms.orderBy("roomNumber").toArray();
  },

  async updateRoom(id: string, input: UpdateRoomInput): Promise<Room> {
    const room = await db.rooms.get(id);
    if (!room) {
      throw new Error("Room not found");
    }

    // Check if room number is being changed and if it conflicts
    if (input.roomNumber && input.roomNumber !== room.roomNumber) {
      const existingRoom = await db.rooms
        .where("roomNumber")
        .equals(input.roomNumber)
        .first();

      if (existingRoom) {
        throw new Error("Room with this number already exists");
      }
    }

    await db.rooms.update(id, {
      ...input,
      updatedAt: Date.now(),
    });

    const updatedRoom = await db.rooms.get(id);
    if (!updatedRoom) {
      throw new Error("Failed to update room");
    }

    return updatedRoom;
  },

  async deleteRoom(id: string): Promise<void> {
    // Check if room has any active bookings
    const activeBookings = await db.bookings
      .where("roomId")
      .equals(id)
      .filter(
        (booking) =>
          booking.status === "Reserved" || booking.status === "Checked-in"
      )
      .count();

    if (activeBookings > 0) {
      throw new Error("Cannot delete room with active bookings");
    }

    await db.rooms.delete(id);
  },

  async filterRooms(filters: {
    status?: RoomStatus;
    type?: RoomType;
    minCapacity?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Room[]> {
    let rooms = await db.rooms.toArray();

    if (filters.status) {
      rooms = rooms.filter((room) => room.status === filters.status);
    }

    if (filters.type) {
      rooms = rooms.filter((room) => room.type === filters.type);
    }

    if (filters.minCapacity) {
      rooms = rooms.filter((room) => room.capacity >= filters.minCapacity!);
    }

    if (filters.maxPrice) {
      rooms = rooms.filter((room) => room.pricePerNight <= filters.maxPrice!);
    }

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      rooms = rooms.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(lowerSearch) ||
          room.type.toLowerCase().includes(lowerSearch) ||
          room.notes?.toLowerCase().includes(lowerSearch)
      );
    }

    return rooms;
  },

  async getAvailableRooms(checkIn: number, checkOut: number): Promise<Room[]> {
    // Get all rooms with Available status
    const availableRooms = await db.rooms
      .where("status")
      .equals("Available")
      .toArray();

    // Get all bookings that overlap with the requested dates
    const allBookings = await db.bookings.toArray();

    const overlappingBookings = allBookings.filter((booking) => {
      // Ignore cancelled and checked-out bookings
      if (booking.status === "Cancelled" || booking.status === "Checked-out") {
        return false;
      }

      // Check for date overlap
      return (
        (checkIn >= booking.checkInDate && checkIn < booking.checkOutDate) ||
        (checkOut > booking.checkInDate && checkOut <= booking.checkOutDate) ||
        (checkIn <= booking.checkInDate && checkOut >= booking.checkOutDate)
      );
    });

    const bookedRoomIds = new Set(overlappingBookings.map((b) => b.roomId));

    return availableRooms.filter((room) => !bookedRoomIds.has(room.id));
  },
};
