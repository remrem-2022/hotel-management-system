"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button, Input, Select, Textarea, Card } from "@/components/ui";
import { createBookingSchema, type CreateBookingInput, PaymentStatus, BookingStatus } from "@/models";
import { bookingService, roomService, auditLogService, AuditAction } from "@/services";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export default function NewBookingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableRooms, setAvailableRooms] = React.useState<any[]>([]);
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      status: "Reserved",
      paymentStatus: "Unpaid",
      paidAmount: 0,
    },
  });

  // Load all available rooms on mount
  React.useEffect(() => {
    loadAllRooms();
  }, []);

  // Reload rooms when dates change
  React.useEffect(() => {
    if (checkIn && checkOut) {
      loadAvailableRooms();
    } else {
      loadAllRooms();
    }
  }, [checkIn, checkOut]);

  const loadAllRooms = async () => {
    const allRooms = await roomService.getAllRooms();
    const available = allRooms.filter(room => room.status === "Available");
    setAvailableRooms(available);
  };

  const loadAvailableRooms = async () => {
    if (!checkIn || !checkOut) return;

    const checkInTimestamp = new Date(checkIn).getTime();
    const checkOutTimestamp = new Date(checkOut).getTime();

    const rooms = await roomService.getAvailableRooms(checkInTimestamp, checkOutTimestamp);
    setAvailableRooms(rooms);
  };

  const onSubmit = async (data: CreateBookingInput) => {
    setIsLoading(true);

    try {
      const booking = await bookingService.createBooking(data);

      if (user) {
        await auditLogService.createLog({
          userId: user.id,
          userName: user.name,
          action: AuditAction.BOOKING_CREATED,
          entityType: "booking",
          entityId: booking.id,
          details: `Created booking for ${booking.guestName}`,
        });
      }

      toast.success("Booking created successfully");
      router.push("/bookings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <Header
        title="New Booking"
       
        actions={
          <Link href="/bookings">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="p-4">
        <Card className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Guest Name"
              placeholder="John Doe"
              error={errors.guestName?.message}
              {...register("guestName")}
            />

            <Input
              label="Guest Contact"
              placeholder="+1-555-0123"
              error={errors.guestContact?.message}
              {...register("guestContact")}
            />

            <Input
              label="Check-in Date"
              type="date"
              min={today}
              error={errors.checkInDate?.message}
              {...register("checkInDate", {
                setValueAs: (v) => v ? new Date(v).getTime() : undefined,
              })}
              onChange={(e) => setCheckIn(e.target.value)}
            />

            <Input
              label="Check-out Date"
              type="date"
              min={checkIn || today}
              error={errors.checkOutDate?.message}
              {...register("checkOutDate", {
                setValueAs: (v) => v ? new Date(v).getTime() : undefined,
              })}
              onChange={(e) => setCheckOut(e.target.value)}
            />

            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Room"
                  error={errors.roomId?.message}
                  helperText={
                    checkIn && checkOut
                      ? `Showing ${availableRooms.length} room${availableRooms.length !== 1 ? 's' : ''} available for selected dates`
                      : `Showing ${availableRooms.length} available room${availableRooms.length !== 1 ? 's' : ''} (select dates to filter)`
                  }
                  options={[
                    { value: "", label: availableRooms.length === 0 ? "No rooms available" : "Select a room" },
                    ...availableRooms.map((room) => ({
                      value: room.id,
                      label: `Room ${room.roomNumber} - ${room.type} ($${room.pricePerNight}/night)`,
                    })),
                  ]}
                  {...field}
                />
              )}
            />

            <Controller
              name="paymentStatus"
              control={control}
              render={({ field }) => (
                <Select
                  label="Payment Status"
                  error={errors.paymentStatus?.message}
                  options={Object.values(PaymentStatus).map((status) => ({
                    value: status,
                    label: status,
                  }))}
                  {...field}
                />
              )}
            />

            <Input
              label="Paid Amount ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.paidAmount?.message}
              {...register("paidAmount", { valueAsNumber: true })}
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="Special requests, preferences, etc."
              error={errors.notes?.message}
              {...register("notes")}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
                Create Booking
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
