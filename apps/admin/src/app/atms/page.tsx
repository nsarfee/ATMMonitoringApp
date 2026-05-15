'use client';
import { useState } from 'react';
import { mockATMs, ATM, ATMStatus } from '@atm/shared';
import StatusBadge from '@/components/StatusBadge';
import { IncidentType, IncidentPriority } from '@/lib/incidents';

const PROBLEM_STATUSES: ATMStatus[] = ['offline', 'warning', 'cash_low', 'maintenance'];

// ── Auto-suggest incident type from ATM status ──────────────────────────────
function suggestType(atm: ATM): IncidentType {
  if (atm.status === 'offline')     return 'atm_offline';
  if (atm.status === 'cash_low')    return 'cash_low';
  if (atm.status === 'maintenance') return 'maintenance';
  // warning — check devices
  const devs = Object.entries(atm.devices);
  if (devs.find(([k, v]) => k === 'cardReader'    && v !== 'ok')) return 'card_jam';
  if (devs.find(([k, v]) => k === 'printer'       && v !== 'ok')) return 'printer_fault';
  if (devs.find(([k, v]) => k === 'network'       && v !== 'ok')) return 'network_fault';
  if (devs.find(([k, v]) => k === 'cashDispenser' && v !== 'ok')) return 'card_jam';
  return 'software_error';
}

function suggestPriority(atm: ATM): IncidentPriority {
  if (atm.status === 'offline') return 'critical';
  if (atm.status === 'cash_low') return 'high';
  if (atm.status === 'warning')  return 'medium';
  return 'low';
}

const INC_TYPES: { value: IncidentType; label: string; icon: string }[] = [
  { value: 'atm_offline',    label: 'ATM Offline',    icon: '⊗' },
  { value: 'cash_low',       label: 'Cash Low',       icon: '💵' },
  { value: 'card_jam',       label: 'Card Jam',       icon: '💳' },
  { value: 'network_fault',  label: 'Network Fault',  icon: '📡' },
  { value: 'printer_fault',  label: 'Printer Fault',  icon: '🖨️' },
  { value: 'power_failure',  label: 'Power Failure',  icon: '⚡' },
  { value: 'software_error', label: 'Software Error', icon: '💻' },
  { value: 'maintenance',    label: 'Maintenance',    icon: '🔧' },
  { value: 'vandalism',      label: 'Vandalism',      icon: '🚨' },
];

const VENDORS = ['TechServ Solutions', 'CashLink Pakistan', 'NetConnect ISP', 'Alpha Maintenance Co.', 'Unassigned'];

// ── Raise Incident Modal ──────────────────────────────────────────────────────
function RaiseIncidentModal({ atm, onClose, onRaised }: {
  atm: ATM;
  onClose: () => void;
  onRaised: (id: string) => void;
}) {
  const [type, setType]       = useState<IncidentType>(suggestType(atm));
  const [priority, setPrio]   = useState<IncidentPriority>(suggestPriority(atm));
  const [vendor, setVendor]   = useState(VENDORS[0]);
  const [desc, setDesc]       = useState('');
  const [raisedBy, setRaisedBy] = useState('Admin User');
  const [submitting, setSubmitting] = useState(false);

  const prioColors: Record<IncidentPriority, string> = {
    critical: 'border-red-500 bg-red-50 text-red-700',
    high:     'border-orange-400 bg-orange-50 text-orange-700',
    medium:   'border-amber-400 bg-amber-50 text-amber-700',
    low:      'border-gray-300 bg-gray-50 text-gray-600',
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const id = `INC-${String(Math.floor(1000 + Math.random() * 9000))}`;
      setSubmitting(false);
      onRaised(id);
      onClose();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between shrink-0" style={{ background: 'linear-gradient(135deg,#f26522,#e05510)' }}>
          <div>
            <p className="text-orange-100 text-[10px] font-bold tracking-widest">RAISE INCIDENT</p>
            <h2 className="text-white font-black text-base leading-tight mt-0.5">{atm.name}</h2>
            <p className="text-orange-200 text-[11px] mt-0.5">{atm.address}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl ml-4 mt-0.5 leading-none">&times;</button>
        </div>

        {/* ATM context strip */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-[11px] shrink-0">
          <div><span className="text-gray-400">Status&nbsp;</span>
            <span className={`font-bold ${
              atm.status==='offline' ? 'text-red-600' :
              atm.status==='cash_low' ? 'text-orange-500' :
              atm.status==='warning' ? 'text-amber-600' : 'text-gray-600'
            }`}>{atm.status.replace('_',' ').toUpperCase()}</span>
          </div>
          <div><span className="text-gray-400">Cash&nbsp;</span>
            <span className={`font-bold ${atm.cashLevel<20?'text-red-600':atm.cashLevel<40?'text-amber-600':'text-gray-700'}`}>{atm.cashLevel}%</span>
          </div>
          <div><span className="text-gray-400">Serial&nbsp;</span><span className="font-mono font-semibold text-gray-600">{atm.serialNumber}</span></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Incident type */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Incident Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {INC_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] font-semibold text-left transition-all ${
                      type === t.value
                        ? 'border-orange-400 bg-orange-50 text-orange-700 ring-1 ring-orange-300'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
                    }`}
                  >
                    <span className="text-sm">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
              <div className="flex gap-2">
                {(['critical','high','medium','low'] as IncidentPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrio(p)}
                    className={`flex-1 py-2 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                      priority === p ? prioColors[p]+' ring-1' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assign Vendor</label>
                <select
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:border-orange-400 bg-white"
                >
                  {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Raised By</label>
                <input
                  value={raisedBy}
                  onChange={e => setRaisedBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe the issue in detail…"
                rows={3}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] resize-none focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !desc.trim()}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#f26522,#e05510)', boxShadow: '0 4px 14px rgba(242,101,34,0.3)' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Raising…
                </span>
              ) : '🚨 Raise Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ id, onDismiss }: { id: string; onDismiss: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white"
      style={{ background: 'linear-gradient(135deg,#15803d,#166534)', boxShadow: '0 8px 24px rgba(21,128,61,0.3)' }}
    >
      <span className="text-lg">✅</span>
      <div>
        <div>Incident raised successfully</div>
        <div className="text-[11px] font-normal text-green-200">{id} created · redirecting to Incidents…</div>
      </div>
      <button onClick={onDismiss} className="ml-2 text-white/60 hover:text-white text-lg leading-none">&times;</button>
    </div>
  );
}

const ALL_STATUSES: ATMStatus[] = ['online', 'offline', 'warning', 'cash_low', 'maintenance'];

// ── Heatmap cell colour by status + cash level ────────────────────────────────
function heatmapColor(atm: ATM) {
  if (atm.status === 'offline')     return { bg: 'bg-red-600',    ring: 'ring-red-700',    text: 'text-white' };
  if (atm.status === 'warning')     return { bg: 'bg-amber-400',  ring: 'ring-amber-500',  text: 'text-white' };
  if (atm.status === 'maintenance') return { bg: 'bg-bop-500',    ring: 'ring-bop-600',    text: 'text-white' };
  if (atm.status === 'cash_low')    return { bg: 'bg-orange-500', ring: 'ring-orange-600', text: 'text-white' };
  // online — shade green by cash level
  if (atm.cashLevel >= 70) return { bg: 'bg-emerald-500', ring: 'ring-emerald-600', text: 'text-white' };
  if (atm.cashLevel >= 40) return { bg: 'bg-emerald-400', ring: 'ring-emerald-500', text: 'text-white' };
  return                    { bg: 'bg-emerald-200', ring: 'ring-emerald-400', text: 'text-emerald-900' };
}

function deviceDots(atm: ATM) {
  return Object.entries(atm.devices).map(([key, val]) => ({
    label: key, ok: val === 'ok', warn: val === 'warning',
  }));
}

// ── Heatmap tooltip / detail card ─────────────────────────────────────────────
function HeatCard({ atm, onClose, onRaise }: { atm: ATM; onClose: () => void; onRaise: (a: ATM) => void }) {
  const c = heatmapColor(atm);
  const isProblem = PROBLEM_STATUSES.includes(atm.status);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`${c.bg} px-5 py-4 flex items-start justify-between`}>
          <div>
            <div className={`font-bold text-base leading-tight ${c.text}`}>{atm.name}</div>
            <div className={`text-[11px] mt-0.5 ${c.text} opacity-80`}>{atm.address}</div>
          </div>
          <button onClick={onClose} className={`${c.text} opacity-70 hover:opacity-100 text-xl ml-3 mt-0.5`}>&times;</button>
        </div>
        <div className="p-5 space-y-4">
          {/* Status + cash */}
          <div className="flex items-center justify-between">
            <StatusBadge status={atm.status} />
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${atm.cashLevel < 20 ? 'bg-red-500' : atm.cashLevel < 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${atm.cashLevel}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">{atm.cashLevel}%</span>
            </div>
          </div>
          {/* Device health */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Device Health</p>
            <div className="grid grid-cols-5 gap-1.5">
              {deviceDots(atm).map(d => (
                <div key={d.label} className="flex flex-col items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${d.ok ? 'bg-emerald-500' : d.warn ? 'bg-amber-400' : 'bg-red-500'}`}>
                    {d.ok ? '\u2713' : d.warn ? '!' : '\u2717'}
                  </div>
                  <span className="text-[9px] text-gray-400 capitalize">{d.label.replace('cashDispenser', 'cash').replace('cardReader', 'card').replace('pinpad', 'pin')}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><span className="text-gray-400 block">Model</span><span className="font-semibold text-gray-700">{atm.model}</span></div>
            <div><span className="text-gray-400 block">Serial</span><span className="font-semibold text-gray-700 font-mono">{atm.serialNumber}</span></div>
            <div><span className="text-gray-400 block">Last Seen</span><span className="font-semibold text-gray-700">{new Date(atm.lastSeen).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div><span className="text-gray-400 block">Location</span><span className="font-semibold text-gray-700">{atm.location}</span></div>
          </div>
          {/* Raise incident CTA */}
          {isProblem && (
            <button
              onClick={() => onRaise(atm)}
              className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#f26522,#e05510)', boxShadow: '0 4px 14px rgba(242,101,34,0.28)' }}
            >
              <span>\ud83d\udea8</span> Raise Incident for this ATM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Legend entry ──────────────────────────────────────────────────────────────
const HEATMAP_LEGEND = [
  { label: 'Online (high cash)',  cls: 'bg-emerald-500' },
  { label: 'Online (mid cash)',   cls: 'bg-emerald-400' },
  { label: 'Online (low cash)',   cls: 'bg-emerald-200' },
  { label: 'Cash Low',            cls: 'bg-orange-500'  },
  { label: 'Warning',             cls: 'bg-amber-400'   },
  { label: 'Maintenance',         cls: 'bg-bop-500'     },
  { label: 'Offline',             cls: 'bg-red-600'     },
];

export default function ATMManagementPage() {
  const [atms, setAtms] = useState<ATM[]>(mockATMs);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ATMStatus | 'all'>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'heatmap'>('list');
  const [heatDetail, setHeatDetail] = useState<ATM | null>(null);
  const [raiseFor, setRaiseFor] = useState<ATM | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function openRaise(atm: ATM) { setHeatDetail(null); setRaiseFor(atm); }
  function onRaised(id: string) {
    setToast(id);
    setTimeout(() => setToast(null), 5000);
  }

  const filtered = atms.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id: string, newStatus: ATMStatus) => {
    setAtms((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    setEditing(null);
  };

  const counts = {
    all: atms.length,
    online: atms.filter(a => a.status === 'online').length,
    offline: atms.filter(a => a.status === 'offline').length,
    warning: atms.filter(a => a.status === 'warning').length,
    cash_low: atms.filter(a => a.status === 'cash_low').length,
    maintenance: atms.filter(a => a.status === 'maintenance').length,
  };

  const tabConfig: { value: ATMStatus | 'all'; label: string; countColor: string }[] = [
    { value: 'all',         label: 'All ATMs',    countColor: 'bg-gray-200 text-gray-700' },
    { value: 'online',      label: 'Online',      countColor: 'bg-emerald-100 text-emerald-700' },
    { value: 'offline',     label: 'Offline',     countColor: 'bg-red-100 text-red-700' },
    { value: 'warning',     label: 'Warning',     countColor: 'bg-amber-100 text-amber-700' },
    { value: 'cash_low',    label: 'Cash Low',    countColor: 'bg-orange-100 text-orange-700' },
    { value: 'maintenance', label: 'Maintenance', countColor: 'bg-bop-100 text-bop-700' },
  ];

  return (
    <div className="p-6 space-y-4">
      {heatDetail && <HeatCard atm={heatDetail} onClose={() => setHeatDetail(null)} onRaise={openRaise} />}
      {raiseFor  && <RaiseIncidentModal atm={raiseFor} onClose={() => setRaiseFor(null)} onRaised={onRaised} />}
      {toast     && <Toast id={toast} onDismiss={() => setToast(null)} />}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name, location or serial…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bop-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="text-xs text-gray-400">{filtered.length} of {atms.length} ATMs shown</div>

        {/* View toggle */}
        <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setView('list')}
            title="List view"
            className={`px-3 py-2 text-sm transition-colors flex items-center gap-1.5 ${
              view === 'list' ? 'bg-bop-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>☰</span>
            <span className="text-[12px] font-semibold">List</span>
          </button>
          <button
            onClick={() => setView('heatmap')}
            title="Heatmap view"
            className={`px-3 py-2 text-sm transition-colors flex items-center gap-1.5 border-l border-gray-200 ${
              view === 'heatmap' ? 'bg-bop-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>⬛</span>
            <span className="text-[12px] font-semibold">Heatmap</span>
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {tabConfig.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterStatus === tab.value
                ? 'bg-bop-600 text-white border-bop-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-bop-300 hover:text-bop-700'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filterStatus === tab.value ? 'bg-white/20 text-white' : tab.countColor}`}>
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
      {view === 'list' && (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bop-600">
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider">ATM / Serial</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider hidden md:table-cell">Address</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider">Cash</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider hidden lg:table-cell">Model</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider hidden lg:table-cell">Last Seen</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/90 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((atm) => (
              <tr key={atm.id} className="hover:bg-bop-50/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-sm text-gray-900">{atm.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">{atm.serialNumber}</div>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-600 hidden md:table-cell max-w-[180px] truncate">{atm.address}</td>
                <td className="px-5 py-3.5">
                  {editing === atm.id ? (
                    <select
                      defaultValue={atm.status}
                      onChange={(e) => handleStatusChange(atm.id, e.target.value as ATMStatus)}
                      className="border border-bop-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-bop-500 bg-white"
                      autoFocus
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={atm.status} />
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${atm.cashLevel < 20 ? 'bg-red-500' : atm.cashLevel < 40 ? 'bg-amber-500' : 'bg-bop-500'}`}
                        style={{ width: `${atm.cashLevel}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${atm.cashLevel < 20 ? 'text-red-600' : atm.cashLevel < 40 ? 'text-amber-600' : 'text-bop-700'}`}>
                      {atm.cashLevel}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-500 hidden lg:table-cell">{atm.model}</td>
                <td className="px-5 py-3.5 text-[11px] text-gray-400 hidden lg:table-cell">
                  {new Date(atm.lastSeen).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-5 py-3.5">
                  {editing === atm.id ? (
                    <button onClick={() => setEditing(null)} className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-1 rounded border border-gray-200 hover:border-gray-300">
                      Cancel
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditing(atm.id)}
                        className="text-xs text-bop-600 hover:text-bop-800 font-semibold px-2 py-1 rounded border border-bop-200 hover:bg-bop-50 transition-colors"
                      >
                        Edit
                      </button>
                      {PROBLEM_STATUSES.includes(atm.status) && (
                        <button
                          onClick={() => openRaise(atm)}
                          className="text-xs font-bold px-2 py-1 rounded border transition-colors"
                          style={{ background: '#fff4ee', border: '1px solid #fdd0b3', color: '#f26522' }}
                          title="Raise incident for this ATM"
                        >
                          🚨 Raise
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                  No ATMs match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* ── HEATMAP VIEW ───────────────────────────────────────────────────── */}
      {view === 'heatmap' && (
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legend</span>
            {HEATMAP_LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3.5 h-3.5 rounded-sm ${l.cls}`} />
                <span className="text-[11px] text-gray-600">{l.label}</span>
              </div>
            ))}
            <span className="ml-auto text-[11px] text-gray-400 italic">Click any cell for details · Problem cells have a Raise Incident option</span>
          </div>

          {/* Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filtered.map(atm => {
                const c = heatmapColor(atm);
                const devices = deviceDots(atm);
                const faultyCount = devices.filter(d => !d.ok).length;
                return (
                  <button
                    key={atm.id}
                    onClick={() => setHeatDetail(atm)}
                    className={`${c.bg} ${c.ring} rounded-xl p-3.5 ring-2 text-left transition-all hover:scale-105 hover:shadow-lg active:scale-100 relative group`}
                  >
                    {PROBLEM_STATUSES.includes(atm.status) && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openRaise(atm); }}
                        className="absolute top-1.5 right-1.5 z-10 text-[9px] font-black px-1.5 py-0.5 rounded bg-white/90 text-orange-600 border border-orange-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Raise incident"
                      >
                        🚨 Raise
                      </button>
                    )}
                    {/* ATM name */}
                    <div className={`text-[11px] font-bold leading-tight ${c.text} line-clamp-2`}>
                      {atm.name.replace('ATM ', '')}
                    </div>

                    {/* Cash bar */}
                    <div className="mt-2 w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/60"
                        style={{ width: `${atm.cashLevel}%` }}
                      />
                    </div>
                    <div className={`mt-0.5 text-[10px] font-semibold ${c.text} opacity-90`}>
                      💵 {atm.cashLevel}%
                    </div>

                    {/* Device dots row */}
                    <div className="mt-2 flex items-center gap-1">
                      {devices.map(d => (
                        <div
                          key={d.label}
                          title={d.label}
                          className={`w-2 h-2 rounded-full ${d.ok ? 'bg-white/70' : d.warn ? 'bg-yellow-300' : 'bg-red-300'}`}
                        />
                      ))}
                      {faultyCount > 0 && (
                        <span className="ml-auto text-[9px] font-bold text-white/90 bg-black/20 rounded px-1">
                          {faultyCount} fault{faultyCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* SLA breach shimmer for offline */}
                    {atm.status === 'offline' && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white animate-ping opacity-70" />
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-gray-400">
                  No ATMs match your search or filter.
                </div>
              )}
            </div>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: 'Online',      count: atms.filter(a => a.status === 'online').length,      cls: 'bg-emerald-500' },
              { label: 'Cash Low',    count: atms.filter(a => a.status === 'cash_low').length,    cls: 'bg-orange-500'  },
              { label: 'Warning',     count: atms.filter(a => a.status === 'warning').length,     cls: 'bg-amber-400'   },
              { label: 'Maintenance', count: atms.filter(a => a.status === 'maintenance').length, cls: 'bg-bop-500'     },
              { label: 'Offline',     count: atms.filter(a => a.status === 'offline').length,     cls: 'bg-red-600'     },
              { label: 'Total',       count: atms.length,                                         cls: 'bg-gray-700'    },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-sm shrink-0 ${s.cls}`} />
                <div>
                  <div className="text-base font-bold text-gray-800">{s.count}</div>
                  <div className="text-[10px] text-gray-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

