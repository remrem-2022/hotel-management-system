import { db } from "./db";
import type { User, CreateUserInput, UpdateUserInput } from "@/models";
import { hashPassword } from "@/utils/auth";
import { v4 as uuidv4 } from "@/utils/uuid";

export const userService = {
  async createUser(input: CreateUserInput): Promise<User> {
    const { password, ...userData } = input;

    // Check if user already exists
    const existingUser = await db.users.where("email").equals(input.email).first();
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const user: User = {
      id: uuidv4(),
      ...userData,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    await db.users.add(user);
    return user;
  },

  async getUserById(id: string): Promise<User | undefined> {
    return await db.users.get(id);
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await db.users.where("email").equals(email).first();
  },

  async getAllUsers(): Promise<User[]> {
    return await db.users.toArray();
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const user = await db.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<User> = {
      ...input,
      updatedAt: Date.now(),
    };

    // If password is being updated, hash it
    if (input.password) {
      updates.passwordHash = await hashPassword(input.password);
    }

    // Remove password from updates (we use passwordHash)
    const { password, ...validUpdates } = updates as any;

    await db.users.update(id, validUpdates);

    const updatedUser = await db.users.get(id);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    return updatedUser;
  },

  async deleteUser(id: string): Promise<void> {
    // Check if this is the last admin
    const user = await db.users.get(id);
    if (user?.role === "admin") {
      const adminCount = await db.users.where("role").equals("admin").count();
      if (adminCount <= 1) {
        throw new Error("Cannot delete the last admin user");
      }
    }

    await db.users.delete(id);
  },

  async searchUsers(query: string): Promise<User[]> {
    const allUsers = await db.users.toArray();
    const lowerQuery = query.toLowerCase();

    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
  },
};
