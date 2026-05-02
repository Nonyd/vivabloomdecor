const statusConfig = {
  NEW: { label: "New", classes: "bg-blue-50 text-blue-700" },
  IN_REVIEW: { label: "In Review", classes: "bg-amber-50 text-amber-700" },
  QUOTED: { label: "Quoted", classes: "bg-purple-50 text-purple-700" },
  BOOKED: { label: "Booked", classes: "bg-green-50 text-green-700" },
  CLOSED: { label: "Closed", classes: "bg-gray-100 text-gray-500" },
  SPAM: { label: "Spam", classes: "bg-red-50 text-red-600" },
};

export default function EnquiryStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.CLOSED;
  return (
    <span
      className={`${config.classes} text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full font-body`}
    >
      {config.label}
    </span>
  );
}
