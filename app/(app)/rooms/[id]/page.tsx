"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Bed, Users, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, ConfirmDialog } from "@/components/ui";
import { roomService, auditLogService, AuditAction } from "@/services";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import type { Room } from "@/models";
import { cn } from "@/utils/cn";

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [roomId, setRoomId] = React.useState<string>("");

  React.useEffect(() => {
    params.then(p => {
      setRoomId(p.id);
    });
  }, [params]);

  React.useEffect(() => {
    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const loadRoom = async () => {
    const data = await roomService.getRoomById(roomId);
    if (data) {
      setRoom(data);
    } else {
      toast.error("Room not found");
      router.push("/rooms");
    }
  };

  const handleDelete = async () => {
    if (!room || !user) return;

    setIsDeleting(true);
    try {
      await roomService.deleteRoom(room.id);

      await auditLogService.createLog({
        userId: user.id,
        userName: user.name,
        action: AuditAction.ROOM_DELETED,
        entityType: "room",
        entityId: room.id,
        details: `Deleted room ${room.roomNumber}`,
      });

      toast.success("Room deleted successfully");
      router.push("/rooms");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete room");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!room) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Occupied":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div>
      <Header
        title={`Room ${room.roomNumber}`}
       
        actions={
          <Link href="/rooms">
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
                Room {room.roomNumber}
              </h2>
              <span className={cn("px-3 py-1 text-sm font-medium rounded-full", getStatusColor(room.status))}>
                {room.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Bed className="w-6 h-6 text-primary-600 dark:text-primary-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{room.type}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{room.capacity}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2">
              <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Price Per Night</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">${room.pricePerNight}</p>
            </div>
          </div>

          {room.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {room.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
              <p className="text-gray-700 dark:text-gray-300">{room.notes}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link href={`/rooms/${room.id}/edit`} className="flex-1">
              <Button variant="primary" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Room
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete room ${room.roomNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
