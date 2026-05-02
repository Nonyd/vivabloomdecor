import { prisma } from "@/lib/prisma";
import InvoiceNewForm from "@/components/admin/InvoiceNewForm";

export default async function NewInvoicePage() {
  const [clients, bookings] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.booking.findMany({
      orderBy: { eventDate: "desc" },
      take: 150,
      select: { id: true, title: true, eventDate: true },
    }),
  ]);

  return <InvoiceNewForm clients={clients} bookings={bookings} />;
}
