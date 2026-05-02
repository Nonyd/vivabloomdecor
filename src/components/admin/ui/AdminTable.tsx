import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-[#EDE8DC] overflow-x-auto", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function AdminTh({ children }: { children: ReactNode }) {
  return (
    <th className="bg-[#F8F5EE] px-6 py-3 text-left font-body text-[11px] uppercase tracking-[0.15em] text-[#4A4843]">
      {children}
    </th>
  );
}

export function AdminTd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-6 py-4 font-body text-[14px] text-[#0F0E0C] border-t border-[#EDE8DC]", className)}>
      {children}
    </td>
  );
}
