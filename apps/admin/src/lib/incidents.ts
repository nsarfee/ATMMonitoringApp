// Shared incident types, mock data, config maps and helpers
// Imported by both /atms and /tickets pages

export type IncidentStatus   = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
export type IncidentType     =
  | 'atm_offline' | 'cash_low' | 'card_jam' | 'network_fault'
  | 'printer_fault' | 'power_failure' | 'software_error' | 'maintenance' | 'vandalism';

export interface Incident {
  id: string;
  atmName: string;
  branchName: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  description: string;
  raisedBy: string;
  assignedVendor: string | null;
  reportedAt: string;
  slaDeadlineAt: string;
  resolvedAt: string | null;
  lastNote: string;
}

const _now = Date.now();
const h    = (n: number) => new Date(_now - n * 3600000).toISOString();
const slaT = (base: string, addHours: number) =>
  new Date(new Date(base).getTime() + addHours * 3600000).toISOString();

export const INCIDENTS: Incident[] = [
  {
    id: 'INC-0041', atmName: 'ATM Shopping Mall East', branchName: 'East Mall',
    type: 'atm_offline', priority: 'critical', status: 'in_progress',
    description: 'ATM went offline. Network connection lost, no response to pings.',
    raisedBy: 'System (Auto)', assignedVendor: 'NetConnect ISP',
    reportedAt: h(3), slaDeadlineAt: slaT(h(3), 2), resolvedAt: null,
    lastNote: 'Technician on-site, investigating switch cabinet.',
  },
  {
    id: 'INC-0040', atmName: 'ATM Airport Terminal 1', branchName: 'Airport Terminal 1',
    type: 'cash_low', priority: 'high', status: 'assigned',
    description: 'Cash level critically low at 12%. Immediate replenishment required.',
    raisedBy: 'Ayesha Malik', assignedVendor: 'CashLink Pakistan',
    reportedAt: h(1.5), slaDeadlineAt: slaT(h(1.5), 4), resolvedAt: null,
    lastNote: 'Van dispatched from North depot, ETA 45 min.',
  },
  {
    id: 'INC-0039', atmName: 'ATM University Campus', branchName: 'University Campus',
    type: 'card_jam', priority: 'high', status: 'in_progress',
    description: 'Card dispenser jam detected. Requires technician inspection.',
    raisedBy: 'System (Auto)', assignedVendor: 'TechServ Solutions',
    reportedAt: h(5), slaDeadlineAt: slaT(h(5), 4), resolvedAt: null,
    lastNote: 'Waiting for spare card reader module.',
  },
  {
    id: 'INC-0038', atmName: 'ATM Hospital Lobby', branchName: 'Hospital Lobby',
    type: 'maintenance', priority: 'low', status: 'assigned',
    description: 'Scheduled bi-annual maintenance window.',
    raisedBy: 'Imran Khan', assignedVendor: 'Alpha Maintenance Co.',
    reportedAt: h(2), slaDeadlineAt: slaT(h(2), 24), resolvedAt: null,
    lastNote: 'Maintenance scheduled for tomorrow 08:00.',
  },
  {
    id: 'INC-0037', atmName: 'ATM Downtown Branch', branchName: 'Downtown Branch',
    type: 'printer_fault', priority: 'medium', status: 'resolved',
    description: 'Receipt printer paper jam. Customers unable to get receipts.',
    raisedBy: 'Sara Hussain', assignedVendor: 'TechServ Solutions',
    reportedAt: h(26), slaDeadlineAt: slaT(h(26), 8), resolvedAt: h(22),
    lastNote: 'Paper roll replaced and printer tested. Closed.',
  },
  {
    id: 'INC-0036', atmName: 'ATM North Station', branchName: 'North Station',
    type: 'power_failure', priority: 'critical', status: 'resolved',
    description: 'ATM lost power due to electrical fault in the station.',
    raisedBy: 'System (Auto)', assignedVendor: 'TechServ Solutions',
    reportedAt: h(48), slaDeadlineAt: slaT(h(48), 2), resolvedAt: h(44),
    lastNote: 'Generator bypass installed. Utility power restored.',
  },
  {
    id: 'INC-0035', atmName: 'ATM Shopping Mall East', branchName: 'East Mall',
    type: 'software_error', priority: 'medium', status: 'new',
    description: 'Transaction error code 0xA4 appearing intermittently. Card transactions failing.',
    raisedBy: 'Zain Ahmed', assignedVendor: null,
    reportedAt: h(0.5), slaDeadlineAt: slaT(h(0.5), 8), resolvedAt: null,
    lastNote: 'Awaiting vendor assignment.',
  },
  {
    id: 'INC-0034', atmName: 'ATM Airport Terminal 1', branchName: 'Airport Terminal 1',
    type: 'network_fault', priority: 'high', status: 'closed',
    description: 'Switch port flapping caused intermittent connectivity drops.',
    raisedBy: 'System (Auto)', assignedVendor: 'NetConnect ISP',
    reportedAt: h(72), slaDeadlineAt: slaT(h(72), 2), resolvedAt: h(68),
    lastNote: 'Switch port replaced. Monitoring stable for 48h. Closed.',
  },
];

export const PRIORITY_CFG: Record<IncidentPriority, { label: string; dot: string; row: string; badge: string }> = {
  critical: { label: 'Critical', dot: 'bg-red-500',    row: 'border-l-red-500',    badge: 'bg-red-100 text-red-700 border-red-200'         },
  high:     { label: 'High',     dot: 'bg-orange-500', row: 'border-l-orange-400', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium:   { label: 'Medium',   dot: 'bg-amber-400',  row: 'border-l-amber-400',  badge: 'bg-amber-100 text-amber-700 border-amber-200'    },
  low:      { label: 'Low',      dot: 'bg-bop-400',    row: 'border-l-bop-400',    badge: 'bg-bop-50 text-bop-700 border-bop-200'           },
};

export const STATUS_CFG: Record<IncidentStatus, { label: string; badge: string; pipeline: string }> = {
  new:         { label: 'New',         badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',    pipeline: 'bg-yellow-50 border-yellow-300 text-yellow-800'   },
  assigned:    { label: 'Assigned',    badge: 'bg-blue-100 text-blue-700 border-blue-200',          pipeline: 'bg-blue-50 border-blue-300 text-blue-700'         },
  in_progress: { label: 'In Progress', badge: 'bg-purple-100 text-purple-700 border-purple-200',    pipeline: 'bg-purple-50 border-purple-300 text-purple-700'   },
  resolved:    { label: 'Resolved',    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', pipeline: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
  closed:      { label: 'Closed',      badge: 'bg-gray-100 text-gray-500 border-gray-200',          pipeline: 'bg-gray-100 border-gray-300 text-gray-500'        },
};

export const TYPE_CFG: Record<IncidentType, { label: string; icon: string }> = {
  atm_offline:   { label: 'ATM Offline',    icon: '⊗' },
  cash_low:      { label: 'Cash Low',       icon: '💵' },
  card_jam:      { label: 'Card Jam',       icon: '💳' },
  network_fault: { label: 'Network Fault',  icon: '📡' },
  printer_fault: { label: 'Printer Fault',  icon: '🖨️' },
  power_failure: { label: 'Power Failure',  icon: '⚡' },
  software_error:{ label: 'Software Error', icon: '💻' },
  maintenance:   { label: 'Maintenance',    icon: '🔧' },
  vandalism:     { label: 'Vandalism',      icon: '🚨' },
};

export const PIPELINE_ORDER: IncidentStatus[] = ['new', 'assigned', 'in_progress', 'resolved', 'closed'];

export const NEXT_STATUS: Partial<Record<IncidentStatus, IncidentStatus>> = {
  new: 'assigned', assigned: 'in_progress', in_progress: 'resolved', resolved: 'closed',
};

export function slaInfo(inc: Incident): { label: string; color: string; breached: boolean } {
  if (inc.resolvedAt) {
    const mins = Math.round(
      (new Date(inc.resolvedAt).getTime() - new Date(inc.reportedAt).getTime()) / 60000
    );
    return { label: `Resolved in ${(mins / 60).toFixed(1)}h`, color: 'text-emerald-600', breached: false };
  }
  const remaining = new Date(inc.slaDeadlineAt).getTime() - Date.now();
  if (remaining < 0) {
    const over = Math.round(-remaining / 60000);
    return { label: `Breached ${over < 60 ? `${over}m` : `${Math.round(over / 60)}h`} ago`, color: 'text-red-600', breached: true };
  }
  const mins = Math.round(remaining / 60000);
  if (mins < 60) return { label: `${mins}m left`, color: 'text-orange-500', breached: false };
  return { label: `${Math.round(mins / 60)}h left`, color: 'text-gray-500', breached: false };
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}
