"use client";

import React from "react";
import { Moon, Sun, Monitor, Download, Upload, Trash2, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, ConfirmDialog } from "@/components/ui";
import { useThemeStore } from "@/store/themeStore";
import { settingsService, auditLogService, AuditAction } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useThemeStore();
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const data = await settingsService.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hotel-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (user) {
        await auditLogService.createLog({
          userId: user.id,
          userName: user.name,
          action: AuditAction.DATA_EXPORTED,
        });
      }

      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await settingsService.importData(text);

      if (user) {
        await auditLogService.createLog({
          userId: user.id,
          userName: user.name,
          action: AuditAction.DATA_IMPORTED,
        });
      }

      toast.success("Data imported successfully. Please refresh the page.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import data");
    }
  };

  const handleReset = async () => {
    setIsResetting(true);

    try {
      await settingsService.resetAllData();

      if (user) {
        await auditLogService.createLog({
          userId: user.id,
          userName: user.name,
          action: AuditAction.DATA_RESET,
        });
      }

      toast.success("All data has been reset. Redirecting...");
      setTimeout(() => window.location.href = "/auth/sign-in", 2000);
    } catch (error) {
      toast.error("Failed to reset data");
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  return (
    <div>
      <Header title="Settings" />

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === "light"
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Light</p>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === "dark"
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Dark</p>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === "system"
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
              }`}
            >
              <Monitor className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">System</p>
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Data Management
          </h2>

          <div className="space-y-3">
            <Button variant="primary" className="w-full" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>

            <Button
              variant="danger"
              className="w-full"
              onClick={() => setShowResetDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Local Storage
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All data is stored locally on your device using IndexedDB. No data is sent to
                external servers. Export your data regularly to prevent data loss.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            About
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Hotel Management System v1.0.0
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Built with Next.js, TypeScript, and Framer Motion
          </p>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will permanently delete all rooms, bookings, and users. This action cannot be undone. Are you sure?"
        confirmText="Reset Everything"
        variant="danger"
        isLoading={isResetting}
      />
    </div>
  );
}
