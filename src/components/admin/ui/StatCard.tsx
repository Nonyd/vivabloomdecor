import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  sublabel,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  sublabel: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EDE8DC]">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={18} className={color} />
      </div>
      <p className="font-display italic text-[#0F0E0C] text-[32px] leading-none">{value}</p>
      <p className="font-body text-[13px] text-[#4A4843] mt-1">{label}</p>
      <p className="font-body text-[11px] text-[#4A4843]/50 mt-0.5">{sublabel}</p>
    </div>
  );
}
