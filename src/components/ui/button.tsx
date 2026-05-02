import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-champagne text-onyx hover:bg-champagne-lt focus-visible:outline-champagne",
  secondary:
    "bg-onyx-mid text-ivory hover:bg-onyx-soft focus-visible:outline-champagne",
  outline:
    "border border-champagne bg-transparent text-champagne hover:bg-champagne hover:text-onyx",
  ghost:
    "bg-transparent text-ivory hover:bg-white/10 border border-white/30 hover:border-champagne",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-xs tracking-wide",
  md: "h-11 px-6 text-sm tracking-wide",
  lg: "h-12 px-8 text-base tracking-wide",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as React.Ref<HTMLButtonElement>}
        {...(Comp === "button" ? { type } : {})}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-body font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
