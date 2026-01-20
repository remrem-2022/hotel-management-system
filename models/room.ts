import { z } from "zod";

export const RoomType = {
  SINGLE: "Single",
  DOUBLE: "Double",
  SUITE: "Suite",
  DELUXE: "Deluxe",
} as const;

export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const RoomStatus = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const roomSchema = z.object({
  id: z.string(),
  roomNumber: z.string(),
  type: z.enum(["Single", "Double", "Suite", "Deluxe"]),
  capacity: z.number().int().positive(),
  pricePerNight: z.number().positive(),
  status: z.enum(["Available", "Occupied", "Maintenance"]),
  amenities: z.array(z.string()),
  photos: z.array(z.string()).optional(), // base64 encoded images
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Room = z.infer<typeof roomSchema>;

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.enum(["Single", "Double", "Suite", "Deluxe"]),
  capacity: z.number().int().positive("Capacity must be a positive number"),
  pricePerNight: z.number().positive("Price must be a positive number"),
  status: z.enum(["Available", "Occupied", "Maintenance"]),
  amenities: z.array(z.string()).default([]),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = createRoomSchema.partial();

export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

export const commonAmenities = [
  "WiFi",
  "TV",
  "Air Conditioning",
  "Mini Bar",
  "Room Service",
  "Safe",
  "Balcony",
  "Ocean View",
  "City View",
  "King Bed",
  "Queen Bed",
  "Twin Beds",
  "Bathroom",
  "Shower",
  "Bathtub",
  "Hair Dryer",
  "Coffee Maker",
  "Refrigerator",
  "Work Desk",
  "Closet",
];
