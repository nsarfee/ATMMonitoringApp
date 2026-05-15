'use client';
import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
type IncidentStatus   = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
type IncidentType     =
  | 'atm_offline' | 'cash_low' | 'card_jam' | 'network_fault'
  | 'printer_fault' | 'power_failure' | 'software_error' | 'maintenance' | 'vandalism';

interface Incident {
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const _now = Date.now();
const h    = (n: number) => new Date(_now - n * 3600000).toISOString();
const slaT = (base: string, addHours: number) =>
  new Date(new Date(base).getTime() + addHours * 3600000).toISOString();

const INCIDENTS: Incident[] = [
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
    id: 'INC-0035', atmName: 'ATM East Mall', branchName: 'East Mall',
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

// ── Config maps ───────────────────────────────────────────────────────────────
const PRIORITY_CFG: Record<IncidentPriority, { label: string; dot: string; row: string; badge: string }> = {
  critical: { label: 'Critical', dot: 'bg-red-500',    row: 'border-l-red-500',    badge: 'bg-red-100 text-red-700 border-red-200'         },
  high:     { label: 'High',     dot: 'bg-orange-500', row: 'border-l-orange-400', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  medium:   { label: 'Medium',   dot: 'bg-amber-400',  row: 'border-l-amber-400',  badge: 'bg-amber-100 text-amber-700 border-amber-200'    },
  low:      { label: 'Low',      dot: 'bg-bop-400',    row: 'border-l-bop-400',    badge: 'bg-bop-50 text-bop-700 border-bop-200'           },
};

const STATUS_CFG: Record<IncidentStatus, { label: string; badge: string; pipeline: string }> = {
  new:         { label: 'New',         badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',    pipeline: 'bg-yellow-50 border-yellow-300 text-yellow-800'   },
  assigned:    { label: 'Assigned',    badge: 'bg-blue-100 text-blue-700 border-blue-200',          pipeline: 'bg-blue-50 border-blue-300 text-blue-700'         },
  in_progress: { label: 'In Progress', badge: 'bg-purple-100 text-purple-700 border-purple-200',    pipeline: 'bg-purple-50 border-purple-300 text-purple-700'   },
  resolved:    { label: 'Resolved',    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', pipeline: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
  closed:      { label: 'Closed',      badge: 'bg-gray-100 text-gray-500 border-gray-200',          pipeline: 'bg-gray-100 border-gray-300 text-gray-500'        },
};

const TYPE_CFG: Record<IncidentType, { label: string; icon: string }> = {
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

const PIPELINE_ORDER: IncidentStatus[] = ['new', 'assigned', 'in_progress', 'resolved', 'closed'];
const NEXT_STATUS: Partial<Record<IncidentStatus, IncidentStatus>> = {
  new: 'assigned', assigned: 'in_progress', in_progress: 'resolved', resolved: 'closed',
};

// ── SLA helpers ───────────────────────────────────────────────────────────────
function slaInfo(inc: Incident): { label: string; color: string; breached: boolean } {
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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ── Incident Detail Drawer ────────────────────────────────────────────────────
function IncidentDrawer({
  incident,
  onClose,
  onAdvance,
}: {
  incident: Incident;
  onClose: () => void;
  onAdvance: (id: string) => void;
}) {
  const p   = PRIORITY_CFG[incident.priority];
  const s   = STATUS_CFG[incident.status];
  const t   = TYPE_CFG[incident.type];
  const sla = slaInfo(incident);
  const next = NEXT_STATUS[incident.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-bop-600 px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-base">{incident.id}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${s.badge}`}>{s.label}</span>
            </div>
            <p className="text-green-200 text-[12px] mt-1 leading-snug">{incident.description}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl ml-4 mt-0.5 shrink-0">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-[12px]">
          {[
            { label: 'ATM',       value: incident.atmName },
            { label: 'Branch',    value: incident.branchName },
            { label: 'Type',      value: `${t.icon} ${t.label}` },
            { label: 'Priority',  value: incident.priority.toUpperCase() },
            { label: 'Raised By', value: incident.raisedBy },
            { label: 'Vendor',    value: incident.assignedVendor ?? '— Unassigned' },
            { label: 'Reported',  value: fmtDate(incident.reportedAt) },
            { label: 'SLA',       value: sla.label },
          ].map(r => (
            <div key={r.label}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{r.label}</div>
              <div className={`font-semibold text-gray-800 mt-0.5 ${r.label === 'SLA' ? sla.color : ''}`}>{r.value}</div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Lifecycle</p>
          <div className="flex items-center">
            {PIPELINE_ORDER.map((st, i) => {
              const isCurrent = st === incident.status;
              const isPast    = PIPELINE_ORDER.indexOf(incident.status) > i;
              return (
                <div key={st} className="flex items-center flex-1">
                  <div className="flex-1 flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                      isCurrent ? 'bg-bop-600 border-bop-600 text-white' :
                      isPast    ? 'bg-emerald-500 border-emerald-500 text-white' :
                                  'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span className={`text-[9px] mt-1 font-semibold ${isCurrent ? 'text-bop-700' : isPast ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {STATUS_CFG[st].label}
                    </span>
                  </div>
                  {i < PIPELINE_ORDER.length - 1 && (
                    <div className={`h-0.5 flex-1 mb-4 ${isPast ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Latest Note</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 leading-relaxed">
            {incident.lastNote}
          </div>
        </div>

        {next && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              onClick={() => { onAdvance(incident.id); onClose(); }}
              className="w-full py-2.5 bg-bop-600 hover:bg-bop-700 active:bg-bop-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              Advance → {STATUS_CFG[next].label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [selected, setSelected]   = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter]     = useState<IncidentStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | 'all'>('all');
  const [search, setSearch] = useState('');

  function advanceStatus(id: string) {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== id) return inc;
      const next = NEXT_STATUS[inc.status];
      if (!next) return inc;
      return { ...inc, status: next, resolvedAt: next === 'resolved' ? new Date().toISOString() : inc.resolvedAt };
    }));
  }

  const filtered = incidents.filter(inc => {
    const matchStatus   = statusFilter   === 'all' || inc.status   === statusFilter;
    const matchPriority = priorityFilter === 'all' || inc.priority === priorityFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      inc.id.toLowerCase().includes(q) ||
      inc.atmName.toLowerCase().includes(q) ||
      inc.branchName.toLowerCase().includes(q) ||
      inc.description.toLowerCase().includes(q) ||
      (inc.assignedVendor ?? '').toLowerCase().includes(q);
    return matchStatus && matchPriority && matchSearch;
  });

  const total    = incidents.length;
  const active   = incidents.filter(i => ['new','assigned','in_progress'].includes(i.status)).length;
  const breached = incidents.filter(i => !i.resolvedAt && new Date(i.slaDeadlineAt) < new Date()).length;
  const critical = incidents.filter(i => i.priority === 'critical' && !i.resolvedAt).length;

  const pipelineCounts = PIPELINE_ORDER.reduce((acc, s) => {
    acc[s] = incidents.filter(i => i.status === s).length;
    return acc;
  }, {} as Record<IncidentStatus, number>);

  // ── Executive metrics ───────────────────────────────────────────────────────
  const slaCompliancePct = total
    ? Math.round(incidents.filter(i => {
        if (!i.resolvedAt) return new Date(i.slaDeadlineAt) > new Date();
        return new Date(i.resolvedAt) <= new Date(i.slaDeadlineAt);
      }).length / total * 100)
    : 100;

  const resolvedIncs = incidents.filter(i => i.resolvedAt);
  const mttr = resolvedIncs.length
    ? (resolvedIncs.reduce((s, i) =>
        s + (new Date(i.resolvedAt!).getTime() - new Date(i.reportedAt).getTime()) / 3600000
      , 0) / resolvedIncs.length).toFixed(1)
    : '—';

  const TREND_7D = [
    { day: 'Mon', vol: 8,  sla: 88 },
    { day: 'Tue', vol: 12, sla: 75 },
    { day: 'Wed', vol: 6,  sla: 100 },
    { day: 'Thu', vol: 14, sla: 71 },
    { day: 'Fri', vol: 9,  sla: 89 },
    { day: 'Sat', vol: 5,  sla: 100 },
    { day: 'Today', vol: total, sla: slaCompliancePct },
  ];
  const maxVol = Math.max(...TREND_7D.map(d => d.vol));

  const typeCountMap: Partial<Record<IncidentType, number>> = {};
  incidents.forEach(i => { typeCountMap[i.type] = (typeCountMap[i.type] ?? 0) + 1; });
  const typeCounts = (Object.entries(typeCountMap) as [IncidentType, number][])
    .sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxTypeCount = typeCounts[0]?.[1] ?? 1;

  const priorityDist = (['critical', 'high', 'medium', 'low'] as IncidentPriority[]).map(p => ({
    p, count: incidents.filter(i => i.priority === p).length,
  }));

  return (
    <>
      {selected && (
        <IncidentDrawer
          incident={incidents.find(i => i.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onAdvance={advanceStatus}
        />
      )}

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Incident Management</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Track, assign and resolve ATM incidents end-to-end</p>
          </div>
          <button className="flex items-center gap-2 bg-bop-600 hover:bg-bop-700 active:bg-bop-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
            <span className="text-base leading-none">＋</span>
            Raise Incident
          </button>
        </div>

        {/* ── Executive Overview ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-[0.15em]">EXECUTIVE OVERVIEW</p>
              <h2 className="text-[14px] font-bold text-gray-800 mt-0.5">7-Day Operational Intelligence</h2>
            </div>
            <div className="flex items-center gap-0 divide-x divide-gray-200">
              <div className="text-center pr-5">
                <div className="text-2xl font-black" style={{ color: slaCompliancePct >= 80 ? '#15803d' : '#dc2626' }}>{slaCompliancePct}%</div>
                <div className="text-[9px] font-bold text-gray-400 tracking-wider mt-0.5">SLA COMPLIANCE</div>
              </div>
              <div className="text-center px-5">
                <div className="text-2xl font-black text-gray-800">{mttr}h</div>
                <div className="text-[9px] font-bold text-gray-400 tracking-wider mt-0.5">AVG MTTR</div>
              </div>
              <div className="text-center pl-5">
                <div className="text-2xl font-black" style={{ color: breached > 0 ? '#dc2626' : '#15803d' }}>{breached}</div>
                <div className="text-[9px] font-bold text-gray-400 tracking-wider mt-0.5">SLA BREACHED</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 7-day volume bars */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">7-DAY INCIDENT VOLUME</p>
              <div className="flex items-end gap-1.5" style={{ height: 96 }}>
                {TREND_7D.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold tabular-nums" style={{ color: d.day === 'Today' ? '#f26522' : '#9ca3af' }}>{d.vol}</span>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.round((d.vol / maxVol) * 64)}px`,
                        minHeight: 4,
                        background: d.day === 'Today' ? '#f26522' : '#fde8d8',
                      }}
                    />
                    <span className="text-[8px] font-bold" style={{ color: d.day === 'Today' ? '#f26522' : '#9ca3af' }}>
                      {d.day === 'Today' ? '●' : d.day.slice(0, 2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Weekly total</span>
                <span className="text-[12px] font-black text-gray-700">{TREND_7D.reduce((s, d) => s + d.vol, 0)}</span>
              </div>
            </div>

            {/* Type breakdown */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">TOP INCIDENT TYPES</p>
              <div className="space-y-2.5">
                {typeCounts.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-[10px] w-24 text-gray-600 truncate shrink-0">
                      {TYPE_CFG[type].icon} {TYPE_CFG[type].label}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.round((count / maxTypeCount) * 100)}%`, background: '#f26522' }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-gray-600 w-3 shrink-0">{count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{typeCounts.length} distinct types</span>
                <span className="text-[10px] text-gray-400">this period</span>
              </div>
            </div>

            {/* Priority distribution + SLA compliance trend */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">PRIORITY DISTRIBUTION</p>
              <div className="space-y-2">
                {priorityDist.map(({ p, count }) => {
                  const pct = Math.round((count / (total || 1)) * 100);
                  const barColors: Record<string, string> = {
                    critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280',
                  };
                  const lblColors: Record<string, string> = {
                    critical: 'text-red-600', high: 'text-orange-500', medium: 'text-amber-500', low: 'text-gray-500',
                  };
                  return (
                    <div key={p} className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold w-14 shrink-0 ${lblColors[p]}`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: `${pct}%`, minWidth: count > 0 ? 6 : 0, background: barColors[p] }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 w-14 text-right shrink-0">
                        {count} · {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mt-4 mb-2">SLA COMPLIANCE TREND</p>
              <div className="flex items-end gap-1" style={{ height: 48 }}>
                {TREND_7D.map(d => (
                  <div key={d.day} className="flex-1">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${Math.round((d.sla / 100) * 44)}px`,
                        background: d.sla >= 90 ? '#22c55e' : d.sla >= 70 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-gray-400">Mon</span>
                <span className="text-[8px] font-bold" style={{ color: '#f26522' }}>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline bar */}
        <div className="grid grid-cols-5 gap-2">
          {PIPELINE_ORDER.map(st => {
            const cfg = STATUS_CFG[st];
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(isActive ? 'all' : st)}
                className={`rounded-xl border-2 px-3 py-2.5 text-center transition-all ${
                  isActive ? cfg.pipeline + ' ring-2 ring-offset-1 ring-bop-400' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl font-black text-gray-800">{pipelineCounts[st]}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${isActive ? '' : 'text-gray-500'}`}>
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Incidents', value: total,    icon: '📋', accent: 'border-bop-500',    textColor: 'text-bop-700'    },
            { label: 'Active',          value: active,   icon: '🔴', accent: 'border-orange-400', textColor: 'text-orange-600' },
            { label: 'SLA Breached',    value: breached, icon: '⏰', accent: 'border-red-500',    textColor: 'text-red-600'    },
            { label: 'Open Critical',   value: critical, icon: '🚨', accent: 'border-red-700',    textColor: 'text-red-700'    },
          ].map(card => (
            <div key={card.label} className={`bg-white rounded-xl border border-gray-200 border-t-4 ${card.accent} p-4 flex items-center gap-3`}>
              <span className="text-2xl">{card.icon}</span>
              <div>
                <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
                <div className="text-xs text-gray-500">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by ID, ATM, branch, vendor or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bop-500/30 focus:border-bop-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                  priorityFilter === p
                    ? 'bg-bop-600 text-white border-bop-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-bop-300 hover:text-bop-600'
                }`}
              >
                {p === 'all' ? 'All Priority' : (
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                      p === 'critical' ? 'bg-red-500' : p === 'high' ? 'bg-orange-500' : p === 'medium' ? 'bg-amber-400' : 'bg-bop-400'
                    }`} />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-bop-600 text-[10px] font-bold uppercase tracking-wider text-green-100 gap-2">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">ATM · Branch</div>
            <div className="col-span-2 hidden sm:block">Type</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 hidden lg:block">Vendor · SLA</div>
            <div className="col-span-1 hidden lg:block">Reported</div>
            <div className="col-span-1 text-right">Detail</div>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-400">No incidents match the current filters.</div>
            )}
            {filtered.map(inc => {
              const p   = PRIORITY_CFG[inc.priority];
              const s   = STATUS_CFG[inc.status];
              const t   = TYPE_CFG[inc.type];
              const sla = slaInfo(inc);
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelected(inc)}
                  className={`grid grid-cols-12 px-5 py-3.5 gap-2 items-center border-l-4 ${p.row} hover:bg-bop-50/20 transition-colors cursor-pointer`}
                >
                  <div className="col-span-1">
                    <span className="text-[11px] font-bold text-bop-700 font-mono">{inc.id}</span>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <div className="text-[12px] font-semibold text-gray-800 truncate">{inc.atmName}</div>
                    <div className="text-[10px] text-gray-400 truncate">{inc.branchName}</div>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-[11px] text-gray-600">{t.icon} {t.label}</span>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${p.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      {p.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${s.badge}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="col-span-2 hidden lg:block">
                    <div className="text-[11px] text-gray-600 truncate">
                      {inc.assignedVendor ?? <span className="text-orange-500 italic">Unassigned</span>}
                    </div>
                    <div className={`text-[10px] font-semibold ${sla.color}`}>{sla.label}</div>
                    {sla.breached && (
                      <span className="inline-block text-[9px] font-bold bg-red-100 text-red-600 px-1.5 rounded mt-0.5">SLA BREACH</span>
                    )}
                  </div>
                  <div className="col-span-1 hidden lg:block text-[11px] text-gray-400">
                    {fmtDate(inc.reportedAt)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="text-bop-500 text-[18px] hover:text-bop-700 select-none">›</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Showing {filtered.length} of {total} incidents</span>
            <span className="text-[11px] text-gray-400">{active} active · {breached} SLA breached</span>
          </div>
        </div>
      </div>
    </>
  );
}

