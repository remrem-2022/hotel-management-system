import { create } from "zustand";
import type { User, Session } from "@/models";
import { authService } from "@/services";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null, session: Session | null) => void;
  signOut: () => Promise<void>;
  hasRole: (role: "admin" | "staff") => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      const current = await authService.getCurrentSession();

      if (current) {
        set({
          user: current.user,
          session: current.session,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({
        user: null,
        session: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  setUser: (user, session) => {
    set({ user, session });
  },

  signOut: async () => {
    const { user } = get();
    if (user) {
      await authService.signOut(user.id);
    }
    set({ user: null, session: null });
  },

  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;

    if (role === "admin") {
      return user.role === "admin";
    }

    return true; // Both admin and staff have staff permissions
  },
}));
