import { format, formatDistance, formatRelative, isToday, isTomorrow, isYesterday } from "date-fns";

export function formatDate(timestamp: number, formatStr: string = "PPP"): string {
  return format(timestamp, formatStr);
}

export function formatDateTime(timestamp: number): string {
  return format(timestamp, "PPP p");
}

export function formatTimeAgo(timestamp: number): string {
  return formatDistance(timestamp, Date.now(), { addSuffix: true });
}

export function formatRelativeDate(timestamp: number): string {
  return formatRelative(timestamp, Date.now());
}

export function getDateLabel(timestamp: number): string {
  if (isToday(timestamp)) return "Today";
  if (isTomorrow(timestamp)) return "Tomorrow";
  if (isYesterday(timestamp)) return "Yesterday";
  return format(timestamp, "MMM d, yyyy");
}

export function getDaysBetween(start: number, end: number): number {
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}
