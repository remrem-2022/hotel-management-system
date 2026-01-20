import Dexie, { Table } from "dexie";
import type { User, Room, Booking, Settings, AuditLog, Session } from "@/models";

export class HotelDatabase extends Dexie {
  users!: Table<User, string>;
  rooms!: Table<Room, string>;
  bookings!: Table<Booking, string>;
  settings!: Table<Settings, string>;
  auditLogs!: Table<AuditLog, string>;
  sessions!: Table<Session, string>;

  constructor() {
    super("HotelManagementDB");

    this.version(1).stores({
      users: "id, email, role, createdAt",
      rooms: "id, roomNumber, type, status, createdAt",
      bookings: "id, roomId, guestName, checkInDate, checkOutDate, status, createdAt",
      settings: "id",
      auditLogs: "id, userId, action, timestamp",
      sessions: "id, userId, token, expiresAt",
    });
  }
}

export const db = new HotelDatabase();

// Initialize default settings
export async function initializeDatabase() {
  const existingSettings = await db.settings.get("app-settings");

  if (!existingSettings) {
    await db.settings.add({
      id: "app-settings",
      theme: "system",
      updatedAt: Date.now(),
    });
  }
}
