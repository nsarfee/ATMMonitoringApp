'use client';
import { useState } from 'react';
import { INCIDENTS, slaInfo } from '@/lib/incidents';

// ── Per-vendor metrics derived from incidents ─────────────────────────────────
function vendorMetrics(companyName: string) {
  const assigned = INCIDENTS.filter(i => i.assignedVendor === companyName);
  const resolved = assigned.filter(i => i.resolvedAt);
  const active   = assigned.filter(i => !i.resolvedAt && i.status !== 'closed');
  const breached = assigned.filter(i => !i.resolvedAt && new Date(i.slaDeadlineAt) < new Date());

  const avgResHours = resolved.length
    ? resolved.reduce((sum, i) => {
        const ms = new Date(i.resolvedAt!).getTime() - new Date(i.reportedAt).getTime();
        return sum + ms / 3600000;
      }, 0) / resolved.length
    : null;

  const slaCompliant = resolved.filter(i =>
    new Date(i.resolvedAt!).getTime() <= new Date(i.slaDeadlineAt).getTime()
  ).length;
  const slaCompliance = resolved.length ? Math.round((slaCompliant / resolved.length) * 100) : null;

  const criticalOpen = active.filter(i => i.priority === 'critical').length;

  return { total: assigned.length, resolved: resolved.length, active: active.length, breached: breached.length, avgResHours, slaCompliance, criticalOpen };
}

// ── Scorecard sub-components ──────────────────────────────────────────────────
function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StarRating({ score }: { score: number }) {
  // score 0–5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-[11px] ${i <= Math.round(score) ? 'text-gold-500' : 'text-gray-300'}`}>★</span>
      ))}
      <span className="ml-1 text-[11px] font-bold text-gray-600">{score.toFixed(1)}</span>
    </div>
  );
}

const ALL_BRANCHES = [
  { id: 'br-001', name: 'Downtown Branch',    city: 'City Center',          atmCount: 1 },
  { id: 'br-002', name: 'Airport Terminal 1', city: 'International Airport', atmCount: 1 },
  { id: 'br-003', name: 'East Mall',          city: 'East District',         atmCount: 1 },
  { id: 'br-004', name: 'University Campus',  city: 'Campus Road',           atmCount: 1 },
  { id: 'br-005', name: 'North Station',      city: 'North Zone',            atmCount: 1 },
  { id: 'br-006', name: 'Hospital Lobby',     city: 'Medical Complex',       atmCount: 1 },
];

type ServiceType = 'hardware' | 'cash_management' | 'network' | 'security' | 'software';
type VendorStatus = 'active' | 'inactive' | 'on_hold';

interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
  branchIds: string[];
  status: VendorStatus;
  contractExpiry: string;
  slaHours: number;
  completedJobs: number;
  // performance scorecard
  slaBreaches: number;        // jobs that exceeded SLA
  avgResolutionHours: number; // actual average resolution time
  customerRating: number;     // 0–5 stars
  reopenedJobs: number;       // jobs reopened after close (quality signal)
  pendingJobs: number;        // currently open / in-progress
}

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v-001',
    companyName: 'TechServ Solutions',
    contactPerson: 'Khalid Mehmood',
    email: 'khalid@techserv.pk',
    phone: '+92 321 1234567',
    serviceType: 'hardware',
    branchIds: ['br-001', 'br-002', 'br-003'],
    status: 'active',
    contractExpiry: '2026-12-31',
    slaHours: 4,
    completedJobs: 38,
    slaBreaches: 3,
    avgResolutionHours: 3.2,
    customerRating: 4.4,
    reopenedJobs: 1,
    pendingJobs: 2,
  },
  {
    id: 'v-002',
    companyName: 'CashLink Pakistan',
    contactPerson: 'Fatima Noor',
    email: 'fatima@cashlink.pk',
    phone: '+92 300 9876543',
    serviceType: 'cash_management',
    branchIds: ['br-001', 'br-004', 'br-005', 'br-006'],
    status: 'active',
    contractExpiry: '2026-09-30',
    slaHours: 2,
    completedJobs: 112,
    slaBreaches: 6,
    avgResolutionHours: 1.8,
    customerRating: 4.7,
    reopenedJobs: 2,
    pendingJobs: 4,
  },
  {
    id: 'v-003',
    companyName: 'NetConnect ISP',
    contactPerson: 'Usman Tariq',
    email: 'usman@netconnect.pk',
    phone: '+92 333 5557890',
    serviceType: 'network',
    branchIds: ['br-002', 'br-003'],
    status: 'active',
    contractExpiry: '2027-03-15',
    slaHours: 1,
    completedJobs: 24,
    slaBreaches: 8,
    avgResolutionHours: 2.1,
    customerRating: 3.2,
    reopenedJobs: 4,
    pendingJobs: 3,
  },
  {
    id: 'v-004',
    companyName: 'SecureGuard Systems',
    contactPerson: 'Amna Riaz',
    email: 'amna@secureguard.pk',
    phone: '+92 311 4440001',
    serviceType: 'security',
    branchIds: ['br-004', 'br-005'],
    status: 'on_hold',
    contractExpiry: '2026-06-30',
    slaHours: 8,
    completedJobs: 9,
    slaBreaches: 5,
    avgResolutionHours: 11.4,
    customerRating: 2.1,
    reopenedJobs: 3,
    pendingJobs: 1,
  },
  {
    id: 'v-005',
    companyName: 'DigiSoft Technologies',
    contactPerson: 'Bilal Hassan',
    email: 'bilal@digisoft.pk',
    phone: '+92 345 2223334',
    serviceType: 'software',
    branchIds: [],
    status: 'inactive',
    contractExpiry: '2025-12-31',
    slaHours: 24,
    completedJobs: 5,
    slaBreaches: 2,
    avgResolutionHours: 20.0,
    customerRating: 2.8,
    reopenedJobs: 1,
    pendingJobs: 0,
  },
  {
    id: 'v-006',
    companyName: 'Alpha Maintenance Co.',
    contactPerson: 'Rabia Qureshi',
    email: 'rabia@alphamaint.pk',
    phone: '+92 322 8889900',
    serviceType: 'hardware',
    branchIds: ['br-006'],
    status: 'active',
    contractExpiry: '2026-11-01',
    slaHours: 6,
    completedJobs: 17,
    slaBreaches: 1,
    avgResolutionHours: 4.8,
    customerRating: 4.1,
    reopenedJobs: 0,
    pendingJobs: 1,
  },
];

const SERVICE_META: Record<ServiceType, { label: string; icon: string; color: string }> = {
  hardware:        { label: 'Hardware',        icon: '🔧', color: 'bg-blue-50 text-blue-700 border-blue-200'     },
  cash_management: { label: 'Cash Management', icon: '💵', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  network:         { label: 'Network',         icon: '📡', color: 'bg-purple-50 text-purple-700 border-purple-200'  },
  security:        { label: 'Security',        icon: '🛡️', color: 'bg-red-50 text-red-700 border-red-200'        },
  software:        { label: 'Software',        icon: '💻', color: 'bg-amber-50 text-amber-700 border-amber-200'   },
};

const STATUS_META: Record<VendorStatus, { label: string; dot: string; text: string; bg: string }> = {
  active:   { label: 'Active',   dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  inactive: { label: 'Inactive', dot: 'bg-gray-400',    text: 'text-gray-500',    bg: 'bg-gray-100 border-gray-200'     },
  on_hold:  { label: 'On Hold',  dot: 'bg-orange-400',  text: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200'  },
};

function vendorInitials(name: string) {
  const words = name.split(' ');
  return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase();
}

function formatExpiry(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const label = d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  if (diffDays < 0)  return { label, warn: 'text-red-600',    tag: 'Expired' };
  if (diffDays < 60) return { label, warn: 'text-orange-600', tag: `${diffDays}d left` };
  return { label, warn: 'text-gray-500', tag: null };
}

// ── Branch Assignment Modal ───────────────────────────────────────────────────
function BranchModal({
  vendor,
  onSave,
  onClose,
}: {
  vendor: Vendor;
  onSave: (vendorId: string, branchIds: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(vendor.branchIds);

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }

  const sm = SERVICE_META[vendor.serviceType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-bop-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Assign Branches</h2>
            <p className="text-green-200 text-[12px] mt-0.5">
              Select branches covered by <span className="font-semibold text-white">{vendor.companyName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none mt-0.5 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Vendor pill */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bop-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {vendorInitials(vendor.companyName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{vendor.companyName}</div>
            <div className="text-[11px] text-gray-400">{vendor.contactPerson} · {vendor.phone}</div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${sm.color}`}>
            {sm.icon} {sm.label}
          </span>
        </div>

        {/* Branch list */}
        <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Service Coverage — {selected.length} of {ALL_BRANCHES.length} branches selected
          </p>
          {ALL_BRANCHES.map(branch => {
            const checked = selected.includes(branch.id);
            return (
              <label
                key={branch.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'bg-bop-50 border-bop-300'
                    : 'bg-gray-50 border-gray-200 hover:border-bop-200 hover:bg-bop-50/40'
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-bop-600 rounded"
                  checked={checked}
                  onChange={() => toggle(branch.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${checked ? 'text-bop-700' : 'text-gray-700'}`}>
                    {branch.name}
                  </div>
                  <div className="text-[11px] text-gray-400">{branch.city}</div>
                </div>
                <span className="text-[10px] text-gray-400">{branch.atmCount} ATM</span>
                {checked && <span className="text-bop-600 text-sm">✓</span>}
              </label>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="px-6 pt-1 pb-2 flex gap-2">
          <button
            onClick={() => setSelected(ALL_BRANCHES.map(b => b.id))}
            className="text-[11px] text-bop-600 hover:text-bop-700 font-semibold"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setSelected([])}
            className="text-[11px] text-gray-400 hover:text-gray-600 font-semibold"
          >
            Clear All
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(vendor.id, selected); onClose(); }}
            className="px-5 py-2 text-sm text-white bg-bop-600 hover:bg-bop-700 active:bg-bop-800 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Save Branches
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Vendor Modal ─────────────────────────────────────────────────────────
const EMPTY_VENDOR: Omit<Vendor, 'id'> = {
  companyName: '', contactPerson: '', email: '', phone: '',
  serviceType: 'hardware', branchIds: [], status: 'active',
  contractExpiry: '', slaHours: 4, completedJobs: 0,
  slaBreaches: 0, avgResolutionHours: 0, customerRating: 0,
  reopenedJobs: 0, pendingJobs: 0,
};

function AddVendorModal({
  onSave, onClose,
}: {
  onSave: (v: Vendor) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Vendor, 'id'>>(EMPTY_VENDOR);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Vendor,'id'>, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof Omit<Vendor,'id'>>(k: K, v: Omit<Vendor,'id'>[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function toggleBranch(id: string) {
    setSelectedBranches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.companyName.trim())   e.companyName   = 'Required';
    if (!form.contactPerson.trim()) e.contactPerson = 'Required';
    if (!form.email.trim())         e.email         = 'Required';
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim())         e.phone         = 'Required';
    if (!form.contractExpiry)       e.contractExpiry = 'Required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      const newVendor: Vendor = {
        ...form,
        id: `v-${Date.now()}`,
        branchIds: selectedBranches,
      };
      onSave(newVendor);
      onClose();
    }, 600);
  }

  const svc = SERVICE_META[form.serviceType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between shrink-0" style={{ background: 'linear-gradient(135deg,#f26522,#e05510)' }}>
          <div>
            <p className="text-orange-100 text-[10px] font-bold tracking-widest">NEW VENDOR</p>
            <h2 className="text-white font-black text-lg leading-tight mt-0.5">Add Service Vendor</h2>
            <p className="text-orange-200 text-[11px] mt-0.5">Register a new vendor and assign branch coverage</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl ml-4 mt-0.5 leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Company details */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">COMPANY DETAILS</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Company Name *</label>
                  <input
                    value={form.companyName}
                    onChange={e => set('companyName', e.target.value)}
                    placeholder="e.g. TechServ Solutions"
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.companyName && <p className="text-[10px] text-red-500 mt-0.5">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Contact Person *</label>
                  <input
                    value={form.contactPerson}
                    onChange={e => set('contactPerson', e.target.value)}
                    placeholder="Full name"
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${errors.contactPerson ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.contactPerson && <p className="text-[10px] text-red-500 mt-0.5">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Phone *</label>
                  <input
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+92 300 0000000"
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="contact@vendor.pk"
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Service type */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">SERVICE TYPE</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(Object.keys(SERVICE_META) as ServiceType[]).map(s => {
                  const meta = SERVICE_META[s];
                  const active = form.serviceType === s;
                  return (
                    <button
                      key={s} type="button"
                      onClick={() => set('serviceType', s)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        active ? meta.color + ' ring-1 ring-offset-1' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{meta.icon}</span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contract & SLA */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">CONTRACT & SLA</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Contract Expiry *</label>
                  <input
                    type="date"
                    value={form.contractExpiry}
                    onChange={e => set('contractExpiry', e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${errors.contractExpiry ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.contractExpiry && <p className="text-[10px] text-red-500 mt-0.5">{errors.contractExpiry}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">SLA (hours)</label>
                  <input
                    type="number" min={1} max={72}
                    value={form.slaHours}
                    onChange={e => set('slaHours', Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value as VendorStatus)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Branch assignment */}
            <div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest mb-3">
                BRANCH COVERAGE — {selectedBranches.length} selected
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_BRANCHES.map(branch => {
                  const checked = selectedBranches.includes(branch.id);
                  return (
                    <label
                      key={branch.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded accent-orange-500"
                        checked={checked}
                        onChange={() => toggleBranch(branch.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-[12px] font-semibold ${checked ? 'text-orange-700' : 'text-gray-700'}`}>{branch.name}</div>
                        <div className="text-[10px] text-gray-400">{branch.city}</div>
                      </div>
                      {checked && <span className="text-orange-500 text-sm">✓</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#f26522,#e05510)', boxShadow: '0 4px 14px rgba(242,101,34,0.28)' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Saving…
                </span>
              ) : `＋ Add ${form.companyName.trim() || 'Vendor'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [assigningVendor, setAssigningVendor] = useState<Vendor | null>(null);
  const [addingVendor, setAddingVendor] = useState(false);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'all'>('all');

  function handleAddVendor(v: Vendor) {
    setVendors(prev => [v, ...prev]);
  }

  function handleSaveBranches(vendorId: string, branchIds: string[]) {
    setVendors(prev =>
      prev.map(v => v.id === vendorId ? { ...v, branchIds } : v)
    );
  }

  const filtered = vendors.filter(v => {
    const matchSearch =
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    const matchService = serviceFilter === 'all' || v.serviceType === serviceFilter;
    return matchSearch && matchService;
  });

  // KPIs
  const totalVendors   = vendors.length;
  const activeVendors  = vendors.filter(v => v.status === 'active').length;
  const expiringSoon   = vendors.filter(v => {
    const d = new Date(v.contractExpiry);
    const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
    return diffDays >= 0 && diffDays < 60;
  }).length;
  const unassigned     = vendors.filter(v => v.branchIds.length === 0).length;

  return (
    <>
      {assigningVendor && (
        <BranchModal
          vendor={assigningVendor}
          onSave={handleSaveBranches}
          onClose={() => setAssigningVendor(null)}
        />      )}
      {addingVendor && (
        <AddVendorModal
          onSave={handleAddVendor}
          onClose={() => setAddingVendor(false)}
        />      )}

      <div className="p-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Vendor Management</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Manage service vendors and assign their branch coverage
            </p>
          </div>
          <button
            onClick={() => setAddingVendor(true)}
            className="flex items-center gap-2 bg-bop-600 hover:bg-bop-700 active:bg-bop-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <span className="text-base leading-none">＋</span>
            Add Vendor
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Vendors',      value: totalVendors,  icon: '🏢', accent: 'border-bop-500',    textColor: 'text-bop-700'     },
            { label: 'Active',             value: activeVendors, icon: '✅', accent: 'border-emerald-500', textColor: 'text-emerald-700' },
            { label: 'Contracts Expiring', value: expiringSoon,  icon: '⏳', accent: 'border-orange-400', textColor: 'text-orange-600'  },
            { label: 'No Branch Assigned', value: unassigned,    icon: '⚠️', accent: 'border-red-400',    textColor: 'text-red-600'     },
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

        {/* ── Performance Scorecards ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Performance Scorecards</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Derived from live incident data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vendors.filter(v => v.status !== 'inactive').map(vendor => {
              const m   = vendorMetrics(vendor.companyName);
              const svc = SERVICE_META[vendor.serviceType];
              const sm  = STATUS_META[vendor.status];

              const slaColor = m.slaCompliance === null ? 'text-gray-400'
                : m.slaCompliance >= 80 ? 'text-emerald-600'
                : m.slaCompliance >= 60 ? 'text-amber-600'
                : 'text-red-600';
              const slaBarColor = m.slaCompliance === null ? 'bg-gray-300'
                : m.slaCompliance >= 80 ? 'bg-emerald-500'
                : m.slaCompliance >= 60 ? 'bg-amber-400'
                : 'bg-red-500';

              const grade = m.slaCompliance === null ? '—'
                : m.slaCompliance >= 85 && vendor.customerRating >= 4 ? 'A'
                : m.slaCompliance >= 70 ? 'B'
                : m.slaCompliance >= 55 ? 'C'
                : 'D';
              const gradeColor = grade === 'A' ? 'bg-emerald-500'
                : grade === 'B' ? 'bg-bop-600'
                : grade === 'C' ? 'bg-amber-500'
                : grade === 'D' ? 'bg-red-500'
                : 'bg-gray-400';

              return (
                <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Card header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      vendor.status === 'on_hold' ? 'bg-orange-400' : 'bg-bop-600'
                    }`}>
                      {vendorInitials(vendor.companyName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 truncate">{vendor.companyName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${svc.color}`}>
                          {svc.icon} {svc.label}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] font-medium ${sm.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                          {sm.label}
                        </span>
                      </div>
                    </div>
                    <div className={`w-9 h-9 rounded-xl ${gradeColor} flex items-center justify-center text-white font-black text-base shrink-0`}>
                      {grade}
                    </div>
                  </div>

                  <div className="px-4 py-3 space-y-3">
                    {/* Incident counts */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Total',    value: m.total,    color: 'text-gray-700'     },
                        { label: 'Active',   value: m.active,   color: m.active > 0 ? 'text-orange-600' : 'text-gray-400' },
                        { label: 'Resolved', value: m.resolved, color: 'text-emerald-600'  },
                        { label: 'Breached', value: m.breached, color: m.breached > 0 ? 'text-red-600' : 'text-gray-400' },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-lg py-2">
                          <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                          <div className="text-[9px] text-gray-400 font-medium uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* SLA Compliance bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SLA Compliance</span>
                        <span className={`text-[12px] font-bold ${slaColor}`}>
                          {m.slaCompliance !== null ? `${m.slaCompliance}%` : 'No data'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${slaBarColor}`}
                          style={{ width: `${m.slaCompliance ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Avg resolution + rating */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Resolution</div>
                        <div className="text-[13px] font-bold text-gray-700 mt-0.5">
                          {m.avgResHours !== null ? `${m.avgResHours.toFixed(1)}h` : '—'}
                          <span className="text-[10px] text-gray-400 font-normal ml-1">(SLA: {vendor.slaHours}h)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</div>
                        <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className={`text-[13px] ${i <= Math.round(vendor.customerRating) ? 'text-gold-500' : 'text-gray-300'}`}>★</span>
                          ))}
                          <span className="ml-1 text-[11px] font-bold text-gray-600">{vendor.customerRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Alert tags */}
                    <div className="flex gap-2 flex-wrap">
                      {m.breached > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 rounded-md">
                          ⚠ {m.breached} SLA breach{m.breached > 1 ? 'es' : ''}
                        </span>
                      )}
                      {m.criticalOpen > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-50 border border-orange-200 text-orange-600 px-2 py-0.5 rounded-md">
                          🚨 {m.criticalOpen} critical open
                        </span>
                      )}
                      {vendor.reopenedJobs > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md">
                          ↩ {vendor.reopenedJobs} reopened
                        </span>
                      )}
                      {m.breached === 0 && m.criticalOpen === 0 && vendor.reopenedJobs === 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-md">
                          ✓ No active issues
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-bop-50 border border-bop-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-bop-600 text-lg shrink-0">🏦</span>
          <div>
            <p className="text-[12px] text-bop-700 font-semibold">Branch-Level Vendor Coverage</p>
            <p className="text-[11px] text-bop-600/80 mt-0.5">
              Each vendor is tagged to one or more branches. When a ticket is raised at a branch,
              only vendors assigned to that branch are eligible for dispatch. Unassigned vendors
              will not appear in ticket assignment workflows.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by company, contact person or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bop-500/30 focus:border-bop-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'hardware', 'cash_management', 'network', 'security', 'software'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setServiceFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                    serviceFilter === s
                      ? 'bg-bop-600 text-white border-bop-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-bop-300 hover:text-bop-600'
                  }`}
                >
                  {s === 'all' ? 'All Services' : SERVICE_META[s].icon + ' ' + SERVICE_META[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-12 px-5 py-3 bg-bop-600 text-[10px] font-bold uppercase tracking-wider text-green-100 gap-3">
            <div className="col-span-3">Vendor</div>
            <div className="col-span-2 hidden md:block">Service · SLA</div>
            <div className="col-span-4">Assigned Branches</div>
            <div className="col-span-2 hidden lg:block">Contract Expiry</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No vendors match the current filter.
              </div>
            )}
            {filtered.map(vendor => {
              const sm = STATUS_META[vendor.status];
              const svc = SERVICE_META[vendor.serviceType];
              const expiry = formatExpiry(vendor.contractExpiry);
              const assignedBranches = ALL_BRANCHES.filter(b => vendor.branchIds.includes(b.id));

              return (
                <div
                  key={vendor.id}
                  className="grid grid-cols-12 px-5 py-3.5 gap-3 items-center hover:bg-bop-50/30 transition-colors"
                >
                  {/* Vendor */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      vendor.status === 'inactive' ? 'bg-gray-400' :
                      vendor.status === 'on_hold'  ? 'bg-orange-400' : 'bg-bop-600'
                    }`}>
                      {vendorInitials(vendor.companyName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{vendor.companyName}</div>
                      <div className="text-[11px] text-gray-400 truncate">{vendor.contactPerson}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sm.dot}`} />
                        <span className={`text-[10px] font-medium ${sm.text}`}>{sm.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service & SLA */}
                  <div className="col-span-2 hidden md:block">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${svc.color}`}>
                      {svc.icon} {svc.label}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">SLA: {vendor.slaHours}h response</div>
                    <div className="text-[10px] text-gray-400">{vendor.completedJobs} jobs done</div>
                  </div>

                  {/* Branches */}
                  <div className="col-span-4 flex flex-wrap gap-1.5 items-center">
                    {assignedBranches.length === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-semibold">
                        ⚠ No Branch Assigned
                      </span>
                    ) : (
                      <>
                        {assignedBranches.slice(0, 3).map(b => (
                          <span
                            key={b.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bop-50 border border-bop-200 text-bop-700 text-[10px] font-medium"
                          >
                            🏦 {b.name}
                          </span>
                        ))}
                        {assignedBranches.length > 3 && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            +{assignedBranches.length - 3} more
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Contract expiry */}
                  <div className="col-span-2 hidden lg:block">
                    <div className={`text-[12px] font-medium ${expiry.warn}`}>{expiry.label}</div>
                    {expiry.tag && (
                      <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        expiry.tag === 'Expired'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {expiry.tag}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => setAssigningVendor(vendor)}
                      title="Assign Branches"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bop-50 hover:bg-bop-100 border border-bop-200 text-bop-700 text-[11px] font-semibold transition-colors"
                    >
                      🏦 <span className="hidden xl:inline">Assign</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Showing {filtered.length} of {totalVendors} vendors
            </span>
            <span className="text-[11px] text-gray-400">
              {activeVendors} active · {totalVendors - activeVendors} inactive/on hold
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
