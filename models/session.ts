import { z } from "zod";

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  rememberMe: z.boolean(),
  createdAt: z.number(),
  expiresAt: z.number(),
});

export type Session = z.infer<typeof sessionSchema>;
