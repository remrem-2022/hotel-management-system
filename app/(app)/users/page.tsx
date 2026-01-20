"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Shield, Users as UsersIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, EmptyState, Input, Modal } from "@/components/ui";
import { userService, auditLogService, AuditAction } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import type { User } from "@/models";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/models";
import { Select } from "@/components/ui";

export default function UsersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const hasRole = useAuthStore((state) => state.hasRole);
  const [users, setUsers] = React.useState<User[]>([]);
  const [search, setSearch] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  React.useEffect(() => {
    if (!hasRole("admin")) {
      router.push("/dashboard");
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await userService.getAllUsers();
    setUsers(data);
  };

  const onSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);

    try {
      const newUser = await userService.createUser(data);

      if (currentUser) {
        await auditLogService.createLog({
          userId: currentUser.id,
          userName: currentUser.name,
          action: AuditAction.USER_CREATED,
          entityType: "user",
          entityId: newUser.id,
          details: `Created user ${newUser.email}`,
        });
      }

      toast.success("User created successfully");
      setShowCreateModal(false);
      reset();
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!hasRole("admin")) {
    return null;
  }

  return (
    <div>
      <Header
        title="Users"
       
        actions={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="Try adjusting your search or add a new user"
            action={{
              label: "Add User",
              onClick: () => setShowCreateModal(true),
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {user.name}
                      </h3>
                      {user.role === "admin" && (
                        <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 capitalize mt-1">
                      {user.role}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
            error={errors.password?.message}
            {...register("password")}
          />

          <Select
            label="Role"
            error={errors.role?.message}
            options={[
              { value: "staff", label: "Staff" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role")}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
