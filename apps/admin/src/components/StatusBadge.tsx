import { ATMStatus } from '@atm/shared';

const config: Record<ATMStatus, { label: string; dot: string; classes: string }> = {
  online:      { label: 'Online',      dot: 'bg-emerald-500', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  offline:     { label: 'Offline',     dot: 'bg-red-500',     classes: 'bg-red-50 text-red-700 border border-red-200' },
  warning:     { label: 'Warning',     dot: 'bg-amber-500',   classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  cash_low:    { label: 'Cash Low',    dot: 'bg-orange-500',  classes: 'bg-orange-50 text-orange-700 border border-orange-200' },
  maintenance: { label: 'Maintenance', dot: 'bg-bop-600',     classes: 'bg-bop-50 text-bop-700 border border-bop-200' },
};

export default function StatusBadge({ status }: { status: ATMStatus }) {
  const { label, dot, classes } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
