import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import EnquiriesClient from "@/components/admin/EnquiriesClient";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const id = typeof searchParams.id === "string" ? searchParams.id : undefined;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const enquiries = await prisma.enquiry.findMany({
    where:
      statusParam && statusParam !== "ALL"
        ? { status: statusParam as "NEW" | "IN_REVIEW" | "QUOTED" | "BOOKED" | "CLOSED" | "SPAM" }
        : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <Suspense
      fallback={<div className="font-body text-[#4A4843] py-12 text-center">Loading enquiries…</div>}
    >
      <EnquiriesClient enquiries={enquiries} selectedId={id} />
    </Suspense>
  );
}
