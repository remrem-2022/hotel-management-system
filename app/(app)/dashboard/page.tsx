"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bed,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { StatCard, Card, EmptyState } from "@/components/ui";
import { roomService, bookingService } from "@/services";
import { calculateOccupancyRate, calculateRevenue } from "@/utils/analytics";
import { formatDate, getDateLabel } from "@/utils/date";
import type { Room, Booking } from "@/models";

export default function DashboardPage() {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [todayCheckIns, setTodayCheckIns] = React.useState<Booking[]>([]);
  const [todayCheckOuts, setTodayCheckOuts] = React.useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = React.useState<Booking[]>([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [roomsData, bookingsData, checkIns, checkOuts, upcoming] = await Promise.all([
      roomService.getAllRooms(),
      bookingService.getAllBookings(),
      bookingService.getTodayCheckIns(),
      bookingService.getTodayCheckOuts(),
      bookingService.getUpcomingBookings(7),
    ]);

    setRooms(roomsData);
    setBookings(bookingsData);
    setTodayCheckIns(checkIns);
    setTodayCheckOuts(checkOuts);
    setUpcomingBookings(upcoming);
  };

  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const availableRooms = rooms.filter((r) => r.status === "Available").length;

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const occupancyRate = calculateOccupancyRate(rooms, bookings, weekAgo, now);

  const activeBookings = bookings.filter(
    (b) => b.status === "Reserved" || b.status === "Checked-in"
  ).length;

  const revenue = calculateRevenue(bookings);

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Occupied Rooms"
            value={occupiedRooms}
            icon={Bed}
            color="primary"
          />
          <StatCard
            title="Available Rooms"
            value={availableRooms}
            icon={Bed}
            color="success"
          />
          <StatCard
            title="Active Bookings"
            value={activeBookings}
            icon={Calendar}
            color="info"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="warning"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Today's Check-ins
              </h2>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>

            {todayCheckIns.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No check-ins scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.slice(0, 3).map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {booking.guestName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(booking.checkInDate, "p")}
                      </p>
                    </div>
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Today's Check-outs
              </h2>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>

            {todayCheckOuts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No check-outs scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.slice(0, 3).map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {booking.guestName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(booking.checkOutDate, "p")}
                      </p>
                    </div>
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Bookings (Next 7 Days)
            </h2>
            <Link
              href="/bookings"
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming bookings"
              description="Check back later for new reservations"
            />
          ) : (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 5).map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {booking.guestName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getDateLabel(booking.checkInDate)} -{" "}
                        {getDateLabel(booking.checkOutDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === "Checked-in"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue Overview
            </h2>
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${revenue.total.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Paid</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ${revenue.paid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                ${revenue.pending.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
