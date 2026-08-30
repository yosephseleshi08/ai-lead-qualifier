import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300": variant === "default",
            "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300": variant === "secondary",
            "border-gray-200 dark:border-gray-700": variant === "outline",
            "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300": variant === "success",
            "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300": variant === "warning",
            "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300": variant === "destructive",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
