"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Calendar as CalendarIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { bookingService, roomService } from "@/services";
import { BookingStatus, type Booking, type Room } from "@/models";
import { formatDate, getDateLabel } from "@/utils/date";
import { cn } from "@/utils/cn";

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "All">("All");

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [bookingsData, roomsData] = await Promise.all([
      bookingService.getAllBookings(),
      roomService.getAllRooms(),
    ]);
    setBookings(bookingsData);
    setRooms(roomsData);
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.roomNumber : "N/A";
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(search.toLowerCase()) ||
      booking.guestContact.toLowerCase().includes(search.toLowerCase()) ||
      getRoomNumber(booking.roomId).includes(search);

    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "Reserved":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Checked-in":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Checked-out":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  return (
    <div>
      <Header
        title="Bookings"
       
        actions={
          <Link href="/bookings/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Booking
            </Button>
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "All")}
          options={[
            { value: "All", label: "All Status" },
            { value: "Reserved", label: "Reserved" },
            { value: "Checked-in", label: "Checked-in" },
            { value: "Checked-out", label: "Checked-out" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
        />

        {filteredBookings.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No bookings found"
            description="Try adjusting your filters or create a new booking"
            action={{
              label: "New Booking",
              onClick: () => window.location.href = "/bookings/new",
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/bookings/${booking.id}`}>
                  <Card hoverable className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {booking.guestName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Room {getRoomNumber(booking.roomId)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          getStatusColor(booking.status)
                        )}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        {getDateLabel(booking.checkInDate)} - {getDateLabel(booking.checkOutDate)}
                      </p>
                      <p className="mt-1">
                        Total: ${booking.totalCost} | Paid: ${booking.paidAmount || 0}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
