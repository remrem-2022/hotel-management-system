import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/utils/cn";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

const colorStyles = {
  primary: "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400",
  success: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
};

export function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colorStyles[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
