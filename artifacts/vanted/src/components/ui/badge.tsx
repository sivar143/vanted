import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary border-transparent hover:bg-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
    destructive: "bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20",
    success: "bg-emerald-500/10 text-emerald-600 border-transparent hover:bg-emerald-500/20",
    outline: "text-foreground border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
