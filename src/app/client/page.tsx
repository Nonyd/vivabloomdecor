import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export default async function ClientPortalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { invoices: true },
    orderBy: { eventDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#F8F5EE] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display italic text-[#0F0E0C] text-[40px] mb-2">My Events</h1>
        <p className="font-body text-[#4A4843] mb-8">
          Signed in as {session.user.email}.{" "}
          <Link href="/api/auth/signout?callbackUrl=/" className="text-[#C9A96E] underline">
            Sign out
          </Link>
        </p>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-2xl p-6 mb-4 border border-[#EDE8DC]"
          >
            <h2 className="font-display italic text-[#0F0E0C] text-2xl">{booking.title}</h2>
            <p className="font-body text-[#4A4843] mt-1">
              {booking.eventDate.toLocaleDateString("en-AU", { dateStyle: "full" })}
            </p>
            {booking.invoices.map((inv) => (
              <a
                key={inv.id}
                href={`/api/invoices/${inv.id}/pdf`}
                className="champagne-outline-btn inline-block mt-4 text-sm"
              >
                Download Invoice #{inv.number}
              </a>
            ))}
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="font-body text-[#4A4843]/70">No bookings linked to your account yet.</p>
        )}
      </div>
    </div>
  );
}
