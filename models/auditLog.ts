import { z } from "zod";

export const AuditAction = {
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  ROOM_CREATED: "room_created",
  ROOM_UPDATED: "room_updated",
  ROOM_DELETED: "room_deleted",
  BOOKING_CREATED: "booking_created",
  BOOKING_UPDATED: "booking_updated",
  BOOKING_CANCELLED: "booking_cancelled",
  BOOKING_CHECKED_IN: "booking_checked_in",
  BOOKING_CHECKED_OUT: "booking_checked_out",
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_OUT: "user_signed_out",
  DATA_EXPORTED: "data_exported",
  DATA_IMPORTED: "data_imported",
  DATA_RESET: "data_reset",
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  action: z.string(),
  entityType: z.string().optional(), // "user", "room", "booking", etc.
  entityId: z.string().optional(),
  details: z.string().optional(),
  timestamp: z.number(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export const createAuditLogSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  action: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  details: z.string().optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
