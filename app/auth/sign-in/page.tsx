"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Hotel, LogIn } from "lucide-react";
import { signInSchema, type SignInInput } from "@/models";
import { authService, auditLogService, AuditAction } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { Button, Input, Card } from "@/components/ui";

export default function SignInPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);

    try {
      const { user, session } = await authService.signIn(data);
      setUser(user, session);

      // Create audit log
      await auditLogService.createLog({
        userId: user.id,
        userName: user.name,
        action: AuditAction.USER_SIGNED_IN,
      });

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="glass" className="p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mb-4">
            <Hotel className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Sign in to your hotel management account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="admin@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
              {...register("rememberMe")}
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me for 30 days
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
            Demo Credentials:
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">
            Admin: admin@example.com / Admin123!
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 font-mono">
            Staff: staff@example.com / Staff123!
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
