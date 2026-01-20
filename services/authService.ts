import { db } from "./db";
import type { User, Session, SignInInput } from "@/models";
import { hashPassword, verifyPassword, generateToken } from "@/utils/auth";
import { v4 as uuidv4 } from "@/utils/uuid";

export const authService = {
  async signIn(input: SignInInput): Promise<{ user: User; session: Session }> {
    const user = await db.users.where("email").equals(input.email).first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Create session
    const token = generateToken();
    const now = Date.now();
    const expiresAt = input.rememberMe
      ? now + 30 * 24 * 60 * 60 * 1000 // 30 days
      : now + 24 * 60 * 60 * 1000; // 1 day

    const session: Session = {
      id: uuidv4(),
      userId: user.id,
      token,
      rememberMe: input.rememberMe || false,
      createdAt: now,
      expiresAt,
    };

    // Clear any existing sessions for this user
    await db.sessions.where("userId").equals(user.id).delete();

    // Add new session
    await db.sessions.add(session);

    return { user, session };
  },

  async signOut(userId: string): Promise<void> {
    await db.sessions.where("userId").equals(userId).delete();
  },

  async getCurrentSession(): Promise<{ user: User; session: Session } | null> {
    // Get the most recent session
    const sessions = await db.sessions.toArray();

    if (sessions.length === 0) {
      return null;
    }

    // Sort by createdAt descending and get the first one
    const session = sessions.sort((a, b) => b.createdAt - a.createdAt)[0];

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await db.sessions.delete(session.id);
      return null;
    }

    // Get user
    const user = await db.users.get(session.userId);

    if (!user) {
      await db.sessions.delete(session.id);
      return null;
    }

    return { user, session };
  },

  async validateSession(token: string): Promise<User | null> {
    const session = await db.sessions.where("token").equals(token).first();

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await db.sessions.delete(session.id);
      return null;
    }

    // Get user
    const user = await db.users.get(session.userId);

    if (!user) {
      await db.sessions.delete(session.id);
      return null;
    }

    return user;
  },

  async extendSession(userId: string): Promise<void> {
    const session = await db.sessions.where("userId").equals(userId).first();

    if (session) {
      const now = Date.now();
      const expiresAt = session.rememberMe
        ? now + 30 * 24 * 60 * 60 * 1000
        : now + 24 * 60 * 60 * 1000;

      await db.sessions.update(session.id, { expiresAt });
    }
  },
};
