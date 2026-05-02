import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
