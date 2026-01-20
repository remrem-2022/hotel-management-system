"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Bed, Users, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { roomService } from "@/services";
import { RoomStatus, RoomType, type Room } from "@/models";
import { cn } from "@/utils/cn";

export default function RoomsPage() {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = React.useState<Room[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<RoomStatus | "All">("All");
  const [typeFilter, setTypeFilter] = React.useState<RoomType | "All">("All");

  React.useEffect(() => {
    loadRooms();
  }, []);

  React.useEffect(() => {
    filterRooms();
  }, [rooms, search, statusFilter, typeFilter]);

  const loadRooms = async () => {
    const data = await roomService.getAllRooms();
    setRooms(data);
  };

  const filterRooms = async () => {
    const filters: any = {};

    if (statusFilter !== "All") {
      filters.status = statusFilter;
    }

    if (typeFilter !== "All") {
      filters.type = typeFilter;
    }

    if (search) {
      filters.search = search;
    }

    const filtered = await roomService.filterRooms(filters);
    setFilteredRooms(filtered);
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Occupied":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  return (
    <div>
      <Header
        title="Rooms"
       
        actions={
          <Link href="/rooms/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Room
            </Button>
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RoomStatus | "All")}
            options={[
              { value: "All", label: "All Status" },
              { value: "Available", label: "Available" },
              { value: "Occupied", label: "Occupied" },
              { value: "Maintenance", label: "Maintenance" },
            ]}
            className="min-w-[140px]"
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RoomType | "All")}
            options={[
              { value: "All", label: "All Types" },
              { value: "Single", label: "Single" },
              { value: "Double", label: "Double" },
              { value: "Suite", label: "Suite" },
              { value: "Deluxe", label: "Deluxe" },
            ]}
            className="min-w-[140px]"
          />
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState
            icon={Bed}
            title="No rooms found"
            description="Try adjusting your filters or add a new room"
            action={{
              label: "Add Room",
              onClick: () => window.location.href = "/rooms/new",
            }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/rooms/${room.id}`}>
                    <Card hoverable className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Room {room.roomNumber}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {room.type}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            getStatusColor(room.status)
                          )}
                        >
                          {room.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Capacity: {room.capacity}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span>${room.pricePerNight}/night</span>
                        </div>

                        {room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {room.amenities.slice(0, 3).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
