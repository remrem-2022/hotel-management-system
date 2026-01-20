"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Ban } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, ConfirmDialog } from "@/components/ui";
import { bookingService, roomService, auditLogService, AuditAction } from "@/services";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import type { Booking, Room } from "@/models";
import { formatDate } from "@/utils/date";
import { cn } from "@/utils/cn";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [bookingId, setBookingId] = React.useState<string>("");

  React.useEffect(() => {
    params.then(p => {
      setBookingId(p.id);
    });
  }, [params]);

  React.useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    const data = await bookingService.getBookingById(bookingId);
    if (data) {
      setBooking(data);
      const roomData = await roomService.getRoomById(data.roomId);
      setRoom(roomData || null);
    }
  };

  const handleCheckIn = async () => {
    if (!booking || !user) return;

    setIsProcessing(true);
    try {
      await bookingService.checkIn(booking.id);

      await auditLogService.createLog({
        userId: user.id,
        userName: user.name,
        action: AuditAction.BOOKING_CHECKED_IN,
        entityType: "booking",
        entityId: booking.id,
      });

      toast.success("Guest checked in successfully");
      loadBooking();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check in");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking || !user) return;

    setIsProcessing(true);
    try {
      await bookingService.checkOut(booking.id);

      await auditLogService.createLog({
        userId: user.id,
        userName: user.name,
        action: AuditAction.BOOKING_CHECKED_OUT,
        entityType: "booking",
        entityId: booking.id,
      });

      toast.success("Guest checked out successfully");
      loadBooking();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check out");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!booking || !user) return;

    setIsProcessing(true);
    try {
      await bookingService.cancelBooking(booking.id);

      await auditLogService.createLog({
        userId: user.id,
        userName: user.name,
        action: AuditAction.BOOKING_CANCELLED,
        entityType: "booking",
        entityId: booking.id,
      });

      toast.success("Booking cancelled");
      setShowCancelDialog(false);
      loadBooking();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
      setIsProcessing(false);
      setShowCancelDialog(false);
    }
  };

  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reserved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Checked-in":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Checked-out":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <Header
        title="Booking Details"
       
        actions={
          <Link href="/bookings">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {booking.guestName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{booking.guestContact}</p>
            </div>
            <span className={cn("px-3 py-1 text-sm font-medium rounded-full", getStatusColor(booking.status))}>
              {booking.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Room</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {room ? `Room ${room.roomNumber}` : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Check-in</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(booking.checkInDate)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Check-out</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(booking.checkOutDate)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Cost</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${booking.totalCost}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Status</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {booking.paymentStatus}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Paid Amount</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ${booking.paidAmount || 0}
              </p>
            </div>
          </div>

          {booking.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
              <p className="text-gray-700 dark:text-gray-300">{booking.notes}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {booking.status === "Reserved" && (
              <Button variant="primary" onClick={handleCheckIn} isLoading={isProcessing} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In
              </Button>
            )}

            {booking.status === "Checked-in" && (
              <Button variant="primary" onClick={handleCheckOut} isLoading={isProcessing} className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            )}

            {(booking.status === "Reserved" || booking.status === "Checked-in") && (
              <Button variant="danger" onClick={() => setShowCancelDialog(true)}>
                <Ban className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmText="Cancel Booking"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
