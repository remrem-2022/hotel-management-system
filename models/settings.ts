import { z } from "zod";

export const settingsSchema = z.object({
  id: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  updatedAt: z.number(),
});

export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = {
  id: "app-settings",
  theme: "system",
  updatedAt: Date.now(),
};
