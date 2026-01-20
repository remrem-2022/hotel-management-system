import { z } from "zod";

export const BookingStatus = {
  RESERVED: "Reserved",
  CHECKED_IN: "Checked-in",
  CHECKED_OUT: "Checked-out",
  CANCELLED: "Cancelled",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  PAID: "Paid",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const bookingSchema = z.object({
  id: z.string(),
  guestName: z.string(),
  guestContact: z.string(),
  roomId: z.string(),
  checkInDate: z.number(), // timestamp
  checkOutDate: z.number(), // timestamp
  status: z.enum(["Reserved", "Checked-in", "Checked-out", "Cancelled"]),
  paymentStatus: z.enum(["Unpaid", "Partial", "Paid"]),
  totalCost: z.number(),
  paidAmount: z.number().optional().default(0),
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Booking = z.infer<typeof bookingSchema>;

export const createBookingSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  guestContact: z.string().min(1, "Guest contact is required"),
  roomId: z.string().min(1, "Room is required"),
  checkInDate: z.number(),
  checkOutDate: z.number(),
  status: z.enum(["Reserved", "Checked-in", "Checked-out", "Cancelled"]).default("Reserved"),
  paymentStatus: z.enum(["Unpaid", "Partial", "Paid"]).default("Unpaid"),
  paidAmount: z.number().optional().default(0),
  notes: z.string().optional(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingSchema = z.object({
  guestName: z.string().min(1, "Guest name is required").optional(),
  guestContact: z.string().min(1, "Guest contact is required").optional(),
  roomId: z.string().optional(),
  checkInDate: z.number().optional(),
  checkOutDate: z.number().optional(),
  status: z.enum(["Reserved", "Checked-in", "Checked-out", "Cancelled"]).optional(),
  paymentStatus: z.enum(["Unpaid", "Partial", "Paid"]).optional(),
  paidAmount: z.number().optional(),
  notes: z.string().optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
