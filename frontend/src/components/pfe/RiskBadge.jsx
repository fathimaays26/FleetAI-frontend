import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

const config = {
  red: { label: "RED", classes: "bg-red-50 text-red-600 border-red-200", Icon: ShieldAlert },
  amber: { label: "AMBER", classes: "bg-amber-50 text-amber-600 border-amber-200", Icon: AlertTriangle },
  green: { label: "GREEN", classes: "bg-emerald-50 text-emerald-600 border-emerald-200", Icon: CheckCircle2 },
};

export default function RiskBadge({ tier }) {
  const { label, classes, Icon } = config[tier] ?? config.green;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${classes}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
