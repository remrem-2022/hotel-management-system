import { db } from "./db";
import type { Booking, CreateBookingInput, UpdateBookingInput, BookingStatus } from "@/models";
import { v4 as uuidv4 } from "@/utils/uuid";
import { roomService } from "./roomService";

export const bookingService = {
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    // Validate dates
    if (input.checkOutDate <= input.checkInDate) {
      throw new Error("Check-out date must be after check-in date");
    }

    // Get room to calculate total cost
    const room = await roomService.getRoomById(input.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Check for double booking
    const overlappingBookings = await this.getOverlappingBookings(
      input.roomId,
      input.checkInDate,
      input.checkOutDate
    );

    if (overlappingBookings.length > 0) {
      throw new Error("Room is not available for the selected dates");
    }

    // Calculate total cost (nights * price per night)
    const nights = Math.ceil(
      (input.checkOutDate - input.checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalCost = nights * room.pricePerNight;

    const now = Date.now();

    const booking: Booking = {
      id: uuidv4(),
      ...input,
      totalCost,
      paidAmount: input.paidAmount || 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.bookings.add(booking);

    // Update room status if checking in immediately
    if (input.status === "Checked-in") {
      await roomService.updateRoom(input.roomId, { status: "Occupied" });
    }

    return booking;
  },

  async getBookingById(id: string): Promise<Booking | undefined> {
    return await db.bookings.get(id);
  },

  async getAllBookings(): Promise<Booking[]> {
    return await db.bookings.orderBy("checkInDate").reverse().toArray();
  },

  async updateBooking(id: string, input: UpdateBookingInput): Promise<Booking> {
    const booking = await db.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // If dates are being changed, validate and check for conflicts
    const newCheckIn = input.checkInDate ?? booking.checkInDate;
    const newCheckOut = input.checkOutDate ?? booking.checkOutDate;

    if (newCheckOut <= newCheckIn) {
      throw new Error("Check-out date must be after check-in date");
    }

    const newRoomId = input.roomId ?? booking.roomId;

    // Check for double booking (excluding current booking)
    const overlappingBookings = await this.getOverlappingBookings(
      newRoomId,
      newCheckIn,
      newCheckOut,
      id
    );

    if (overlappingBookings.length > 0) {
      throw new Error("Room is not available for the selected dates");
    }

    // Recalculate total cost if dates or room changed
    let totalCost = booking.totalCost;
    if (
      input.checkInDate ||
      input.checkOutDate ||
      input.roomId
    ) {
      const room = await roomService.getRoomById(newRoomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const nights = Math.ceil(
        (newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24)
      );
      totalCost = nights * room.pricePerNight;
    }

    await db.bookings.update(id, {
      ...input,
      totalCost,
      updatedAt: Date.now(),
    });

    const updatedBooking = await db.bookings.get(id);
    if (!updatedBooking) {
      throw new Error("Failed to update booking");
    }

    return updatedBooking;
  },

  async deleteBooking(id: string): Promise<void> {
    await db.bookings.delete(id);
  },

  async checkIn(id: string): Promise<Booking> {
    const booking = await db.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "Reserved") {
      throw new Error("Only reserved bookings can be checked in");
    }

    await db.bookings.update(id, {
      status: "Checked-in",
      updatedAt: Date.now(),
    });

    // Update room status
    await roomService.updateRoom(booking.roomId, { status: "Occupied" });

    const updatedBooking = await db.bookings.get(id);
    if (!updatedBooking) {
      throw new Error("Failed to check in");
    }

    return updatedBooking;
  },

  async checkOut(id: string): Promise<Booking> {
    const booking = await db.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "Checked-in") {
      throw new Error("Only checked-in bookings can be checked out");
    }

    await db.bookings.update(id, {
      status: "Checked-out",
      updatedAt: Date.now(),
    });

    // Update room status to Available
    await roomService.updateRoom(booking.roomId, { status: "Available" });

    const updatedBooking = await db.bookings.get(id);
    if (!updatedBooking) {
      throw new Error("Failed to check out");
    }

    return updatedBooking;
  },

  async cancelBooking(id: string): Promise<Booking> {
    const booking = await db.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "Checked-out" || booking.status === "Cancelled") {
      throw new Error("Cannot cancel this booking");
    }

    await db.bookings.update(id, {
      status: "Cancelled",
      updatedAt: Date.now(),
    });

    // If room was occupied, make it available
    if (booking.status === "Checked-in") {
      await roomService.updateRoom(booking.roomId, { status: "Available" });
    }

    const updatedBooking = await db.bookings.get(id);
    if (!updatedBooking) {
      throw new Error("Failed to cancel booking");
    }

    return updatedBooking;
  },

  async getOverlappingBookings(
    roomId: string,
    checkIn: number,
    checkOut: number,
    excludeBookingId?: string
  ): Promise<Booking[]> {
    const bookings = await db.bookings.where("roomId").equals(roomId).toArray();

    return bookings.filter((booking) => {
      // Exclude the booking being updated
      if (excludeBookingId && booking.id === excludeBookingId) {
        return false;
      }

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
  },

  async filterBookings(filters: {
    status?: BookingStatus;
    roomId?: string;
    startDate?: number;
    endDate?: number;
    search?: string;
  }): Promise<Booking[]> {
    let bookings = await db.bookings.toArray();

    if (filters.status) {
      bookings = bookings.filter((b) => b.status === filters.status);
    }

    if (filters.roomId) {
      bookings = bookings.filter((b) => b.roomId === filters.roomId);
    }

    if (filters.startDate) {
      bookings = bookings.filter((b) => b.checkInDate >= filters.startDate!);
    }

    if (filters.endDate) {
      bookings = bookings.filter((b) => b.checkOutDate <= filters.endDate!);
    }

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.guestName.toLowerCase().includes(lowerSearch) ||
          b.guestContact.toLowerCase().includes(lowerSearch)
      );
    }

    return bookings.sort((a, b) => b.checkInDate - a.checkInDate);
  },

  async getUpcomingBookings(days: number = 7): Promise<Booking[]> {
    const now = Date.now();
    const futureDate = now + days * 24 * 60 * 60 * 1000;

    const bookings = await db.bookings
      .where("checkInDate")
      .between(now, futureDate)
      .toArray();

    return bookings.filter(
      (b) => b.status === "Reserved" || b.status === "Checked-in"
    );
  },

  async getTodayCheckIns(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const bookings = await db.bookings
      .where("checkInDate")
      .between(todayStart, todayEnd)
      .toArray();

    return bookings.filter((b) => b.status === "Reserved");
  },

  async getTodayCheckOuts(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const bookings = await db.bookings
      .where("checkOutDate")
      .between(todayStart, todayEnd)
      .toArray();

    return bookings.filter((b) => b.status === "Checked-in");
  },
};
