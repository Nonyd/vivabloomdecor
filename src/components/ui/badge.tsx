import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "muted";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-champagne/40 bg-champagne/15 text-onyx",
  success: "border-sage/40 bg-sage/15 text-onyx",
  warning: "border-blush/50 bg-blush/20 text-onyx",
  muted: "border-charcoal/20 bg-charcoal/10 text-charcoal",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-body text-[11px] font-medium uppercase tracking-[0.2em]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
