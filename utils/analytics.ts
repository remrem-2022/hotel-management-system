import type { Room, Booking } from "@/models";

export function calculateOccupancyRate(
  rooms: Room[],
  bookings: Booking[],
  startDate: number,
  endDate: number
): number {
  if (rooms.length === 0) return 0;

  const totalRooms = rooms.length;
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  if (days <= 0) return 0;

  // Count occupied room-nights
  let occupiedRoomNights = 0;

  bookings.forEach((booking) => {
    // Only count non-cancelled bookings
    if (booking.status === "Cancelled") return;

    // Calculate overlap with the date range
    const bookingStart = Math.max(booking.checkInDate, startDate);
    const bookingEnd = Math.min(booking.checkOutDate, endDate);

    if (bookingStart < bookingEnd) {
      const nights = Math.ceil((bookingEnd - bookingStart) / (1000 * 60 * 60 * 24));
      occupiedRoomNights += nights;
    }
  });

  const totalRoomNights = totalRooms * days;
  return (occupiedRoomNights / totalRoomNights) * 100;
}

export function calculateRevenue(bookings: Booking[]): {
  total: number;
  paid: number;
  pending: number;
} {
  let total = 0;
  let paid = 0;
  let pending = 0;

  bookings.forEach((booking) => {
    // Don't count cancelled bookings
    if (booking.status === "Cancelled") return;

    total += booking.totalCost;
    paid += booking.paidAmount || 0;
  });

  pending = total - paid;

  return { total, paid, pending };
}

export function getOccupiedRooms(rooms: Room[]): number {
  return rooms.filter((room) => room.status === "Occupied").length;
}

export function getAvailableRooms(rooms: Room[]): number {
  return rooms.filter((room) => room.status === "Available").length;
}

export function getMaintenanceRooms(rooms: Room[]): number {
  return rooms.filter((room) => room.status === "Maintenance").length;
}
