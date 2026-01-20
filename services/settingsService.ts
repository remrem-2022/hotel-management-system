import { db } from "./db";
import type { Settings } from "@/models";

export const settingsService = {
  async getSettings(): Promise<Settings> {
    const settings = await db.settings.get("app-settings");

    if (!settings) {
      const defaultSettings: Settings = {
        id: "app-settings",
        theme: "system",
        updatedAt: Date.now(),
      };
      await db.settings.add(defaultSettings);
      return defaultSettings;
    }

    return settings;
  },

  async updateSettings(updates: Partial<Omit<Settings, "id">>): Promise<Settings> {
    await db.settings.update("app-settings", {
      ...updates,
      updatedAt: Date.now(),
    });

    const updatedSettings = await db.settings.get("app-settings");
    if (!updatedSettings) {
      throw new Error("Failed to update settings");
    }

    return updatedSettings;
  },

  async resetAllData(): Promise<void> {
    await db.transaction("rw", [db.users, db.rooms, db.bookings, db.auditLogs, db.sessions], async () => {
      await db.users.clear();
      await db.rooms.clear();
      await db.bookings.clear();
      await db.auditLogs.clear();
      await db.sessions.clear();
    });
  },

  async exportData(): Promise<string> {
    const data = {
      users: await db.users.toArray(),
      rooms: await db.rooms.toArray(),
      bookings: await db.bookings.toArray(),
      settings: await db.settings.toArray(),
      auditLogs: await db.auditLogs.toArray(),
      exportedAt: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      await db.transaction("rw", [db.users, db.rooms, db.bookings, db.settings, db.auditLogs], async () => {
        // Clear existing data
        await db.users.clear();
        await db.rooms.clear();
        await db.bookings.clear();
        await db.auditLogs.clear();

        // Import new data
        if (data.users && Array.isArray(data.users)) {
          await db.users.bulkAdd(data.users);
        }

        if (data.rooms && Array.isArray(data.rooms)) {
          await db.rooms.bulkAdd(data.rooms);
        }

        if (data.bookings && Array.isArray(data.bookings)) {
          await db.bookings.bulkAdd(data.bookings);
        }

        if (data.settings && Array.isArray(data.settings)) {
          await db.settings.clear();
          await db.settings.bulkAdd(data.settings);
        }

        if (data.auditLogs && Array.isArray(data.auditLogs)) {
          await db.auditLogs.bulkAdd(data.auditLogs);
        }
      });
    } catch (error) {
      throw new Error("Invalid data format. Please provide a valid JSON export.");
    }
  },
};
