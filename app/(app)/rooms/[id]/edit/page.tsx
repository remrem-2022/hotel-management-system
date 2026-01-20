"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button, Input, Select, Textarea, Card } from "@/components/ui";
import { updateRoomSchema, type UpdateRoomInput, RoomType, RoomStatus, commonAmenities } from "@/models";
import { roomService, auditLogService, AuditAction } from "@/services";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import type { Room } from "@/models";

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [room, setRoom] = React.useState<Room | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);
  const [roomId, setRoomId] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateRoomInput>({
    resolver: zodResolver(updateRoomSchema),
  });

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
      setSelectedAmenities(data.amenities);
      reset({
        roomNumber: data.roomNumber,
        type: data.type,
        capacity: data.capacity,
        pricePerNight: data.pricePerNight,
        status: data.status,
        notes: data.notes,
      });
    }
  };

  const onSubmit = async (data: UpdateRoomInput) => {
    if (!room || !user) return;

    setIsLoading(true);

    try {
      await roomService.updateRoom(room.id, {
        ...data,
        amenities: selectedAmenities,
      });

      await auditLogService.createLog({
        userId: user.id,
        userName: user.name,
        action: AuditAction.ROOM_UPDATED,
        entityType: "room",
        entityId: room.id,
        details: `Updated room ${room.roomNumber}`,
      });

      toast.success("Room updated successfully");
      router.push(`/rooms/${room.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update room");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  if (!room) return null;

  return (
    <div>
      <Header
        title={`Edit Room ${room.roomNumber}`}
        actions={
          <Link href={`/rooms/${room.id}`}>
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
              label="Room Number"
              error={errors.roomNumber?.message}
              {...register("roomNumber")}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Room Type"
                  error={errors.type?.message}
                  options={Object.values(RoomType).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  {...field}
                />
              )}
            />

            <Input
              label="Capacity"
              type="number"
              error={errors.capacity?.message}
              {...register("capacity", { valueAsNumber: true })}
            />

            <Input
              label="Price Per Night ($)"
              type="number"
              step="0.01"
              error={errors.pricePerNight?.message}
              {...register("pricePerNight", { valueAsNumber: true })}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  error={errors.status?.message}
                  options={Object.values(RoomStatus).map((status) => ({
                    value: status,
                    label: status,
                  }))}
                  {...field}
                />
              )}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      selectedAmenities.includes(amenity)
                        ? "bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300"
                        : "bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Notes (Optional)"
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
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
