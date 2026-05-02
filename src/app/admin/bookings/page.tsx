import { prisma } from "@/lib/prisma";
import BookingsClient from "@/components/admin/BookingsClient";

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { eventDate: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return <BookingsClient bookings={bookings} />;
}
