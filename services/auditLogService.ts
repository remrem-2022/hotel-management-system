import { db } from "./db";
import type { AuditLog, CreateAuditLogInput } from "@/models";
import { v4 as uuidv4 } from "@/utils/uuid";

export const auditLogService = {
  async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
    const log: AuditLog = {
      id: uuidv4(),
      ...input,
      timestamp: Date.now(),
    };

    await db.auditLogs.add(log);
    return log;
  },

  async getAllLogs(): Promise<AuditLog[]> {
    return await db.auditLogs.orderBy("timestamp").reverse().toArray();
  },

  async getLogsByUser(userId: string): Promise<AuditLog[]> {
    return await db.auditLogs.where("userId").equals(userId).reverse().toArray();
  },

  async getLogsByAction(action: string): Promise<AuditLog[]> {
    return await db.auditLogs.where("action").equals(action).reverse().toArray();
  },

  async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    return await db.auditLogs.orderBy("timestamp").reverse().limit(limit).toArray();
  },

  async clearOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const oldLogs = await db.auditLogs.where("timestamp").below(cutoffTime).toArray();

    await db.auditLogs.where("timestamp").below(cutoffTime).delete();

    return oldLogs.length;
  },
};
