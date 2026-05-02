import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#EDE8DC]", className)}>{children}</div>
  );
}
