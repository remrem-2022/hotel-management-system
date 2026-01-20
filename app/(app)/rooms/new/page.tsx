"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button, Input, Select, Textarea, Card } from "@/components/ui";
import { createRoomSchema, type CreateRoomInput, RoomType, RoomStatus, commonAmenities } from "@/models";
import { roomService, auditLogService, AuditAction } from "@/services";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export default function NewRoomPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      status: "Available",
      amenities: [],
    },
  });

  const onSubmit = async (data: CreateRoomInput) => {
    setIsLoading(true);

    try {
      const room = await roomService.createRoom({
        ...data,
        amenities: selectedAmenities,
      });

      if (user) {
        await auditLogService.createLog({
          userId: user.id,
          userName: user.name,
          action: AuditAction.ROOM_CREATED,
          entityType: "room",
          entityId: room.id,
          details: `Created room ${room.roomNumber}`,
        });
      }

      toast.success("Room created successfully");
      router.push("/rooms");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div>
      <Header
        title="Add New Room"
       
        actions={
          <Link href="/rooms">
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
              placeholder="101"
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
              placeholder="2"
              error={errors.capacity?.message}
              {...register("capacity", { valueAsNumber: true })}
            />

            <Input
              label="Price Per Night ($)"
              type="number"
              step="0.01"
              placeholder="150.00"
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
              placeholder="Any additional information..."
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
                Create Room
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
