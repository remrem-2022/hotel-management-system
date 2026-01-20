import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "glass";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = "default", hoverable = false, ...props }, ref) => {
    const variants = {
      default:
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm",
      outline: "bg-transparent border-2 border-gray-300 dark:border-gray-600",
      glass:
        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl p-4 transition-all",
          variants[variant],
          hoverable && "cursor-pointer hover:shadow-md",
          className
        )}
        whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
        whileTap={hoverable ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
