"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Hotel, UserPlus } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/models";
import { userService } from "@/services";
import { toast } from "@/store/toastStore";
import { Button, Input, Card } from "@/components/ui";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true);

    try {
      await userService.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "staff", // New users are staff by default
      });

      toast.success("Account created successfully! Please sign in.");
      router.push("/auth/sign-in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
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
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Join the hotel management system
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
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

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
