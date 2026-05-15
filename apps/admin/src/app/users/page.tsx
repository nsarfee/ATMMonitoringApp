'use client';
import { useState } from 'react';

// ── Branch catalogue (derived from ATM fleet locations) ───────────────────────
const ALL_BRANCHES = [
  { id: 'br-001', name: 'Downtown Branch',    city: 'City Center',         atmCount: 1 },
  { id: 'br-002', name: 'Airport Terminal 1', city: 'International Airport', atmCount: 1 },
  { id: 'br-003', name: 'East Mall',          city: 'East District',        atmCount: 1 },
  { id: 'br-004', name: 'University Campus',  city: 'Campus Road',          atmCount: 1 },
  { id: 'br-005', name: 'North Station',      city: 'North Zone',           atmCount: 1 },
  { id: 'br-006', name: 'Hospital Lobby',     city: 'Medical Complex',      atmCount: 1 },
];

type Role = 'super_admin' | 'branch_admin' | 'supervisor' | 'operator';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchIds: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  department: string;
}

const INITIAL_USERS: User[] = [
  {
    id: 'u-001',
    name: 'Imran Khan',
    email: 'imran.khan@bop.com.pk',
    role: 'super_admin',
    branchIds: ['br-001','br-002','br-003','br-004','br-005','br-006'],
    status: 'active',
    lastLogin: '2026-05-14T10:30:00Z',
    department: 'IT Operations',
  },
  {
    id: 'u-002',
    name: 'Ayesha Malik',
    email: 'ayesha.malik@bop.com.pk',
    role: 'branch_admin',
    branchIds: ['br-001', 'br-003'],
    status: 'active',
    lastLogin: '2026-05-14T08:15:00Z',
    department: 'Branch Operations',
  },
  {
    id: 'u-003',
    name: 'Zain Ahmed',
    email: 'zain.ahmed@bop.com.pk',
    role: 'supervisor',
    branchIds: ['br-002', 'br-004', 'br-005'],
    status: 'active',
    lastLogin: '2026-05-13T17:45:00Z',
    department: 'ATM Services',
  },
  {
    id: 'u-004',
    name: 'Sara Hussain',
    email: 'sara.hussain@bop.com.pk',
    role: 'operator',
    branchIds: ['br-003'],
    status: 'active',
    lastLogin: '2026-05-14T09:00:00Z',
    department: 'ATM Services',
  },
  {
    id: 'u-005',
    name: 'Omar Farooq',
    email: 'omar.farooq@bop.com.pk',
    role: 'operator',
    branchIds: ['br-005', 'br-006'],
    status: 'inactive',
    lastLogin: '2026-05-10T14:20:00Z',
    department: 'Field Support',
  },
  {
    id: 'u-006',
    name: 'Hina Baig',
    email: 'hina.baig@bop.com.pk',
    role: 'supervisor',
    branchIds: [],
    status: 'suspended',
    lastLogin: '2026-04-28T11:00:00Z',
    department: 'Security',
  },
];

const ROLE_META: Record<Role, { label: string; color: string }> = {
  super_admin:  { label: 'Super Admin',   color: 'bg-bop-50 text-bop-700 border-bop-200' },
  branch_admin: { label: 'Branch Admin',  color: 'bg-gold-400/20 text-yellow-800 border-yellow-300' },
  supervisor:   { label: 'Supervisor',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  operator:     { label: 'Operator',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATUS_META: Record<User['status'], { label: string; dot: string; text: string }> = {
  active:    { label: 'Active',    dot: 'bg-emerald-400', text: 'text-emerald-700' },
  inactive:  { label: 'Inactive',  dot: 'bg-gray-400',    text: 'text-gray-500'   },
  suspended: { label: 'Suspended', dot: 'bg-red-400',     text: 'text-red-600'    },
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Branch Assignment Modal ───────────────────────────────────────────────────
function BranchModal({
  user,
  onSave,
  onClose,
}: {
  user: User;
  onSave: (userId: string, branchIds: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(user.branchIds);

  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-bop-600 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Assign Branches</h2>
            <p className="text-green-200 text-[12px] mt-0.5">
              Select branches accessible to <span className="font-semibold text-white">{user.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none mt-0.5 transition-colors"
          >
            ×
          </button>
        </div>

        {/* User pill */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-bop-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials(user.name)}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{user.name}</div>
            <div className="text-[11px] text-gray-400">{user.email}</div>
          </div>
          <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${ROLE_META[user.role].color}`}>
            {ROLE_META[user.role].label}
          </span>
        </div>

        {/* Branch list */}
        <div className="px-6 py-4 space-y-2 max-h-72 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Available Branches — {selected.length} of {ALL_BRANCHES.length} selected
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
                {checked && (
                  <span className="text-bop-600 text-sm">✓</span>
                )}
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
            onClick={() => { onSave(user.id, selected); onClose(); }}
            className="px-5 py-2 text-sm text-white bg-bop-600 hover:bg-bop-700 active:bg-bop-800 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Save Branches
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User Form Modal (Add + Edit) ─────────────────────────────────────────────
const EMPTY_USER: Omit<User, 'id' | 'lastLogin'> = {
  name: '', email: '', role: 'operator',
  branchIds: [], status: 'active', department: '',
};

function UserFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial: User | null;          // null = add mode
  onSave: (u: User) => void;
  onClose: () => void;
}) {
  const isEdit = initial !== null;
  const [form, setForm] = useState<Omit<User, 'id' | 'lastLogin'>>(
    initial
      ? { name: initial.name, email: initial.email, role: initial.role,
          branchIds: initial.branchIds, status: initial.status, department: initial.department }
      : EMPTY_USER
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  }

  function toggleBranch(id: string) {
    setForm(f => ({
      ...f,
      branchIds: f.branchIds.includes(id)
        ? f.branchIds.filter(b => b !== id)
        : [...f.branchIds, id],
    }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim())       e.name       = 'Required';
    if (!form.email.trim())      e.email      = 'Required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.department.trim()) e.department = 'Required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      const saved: User = {
        id:        initial?.id ?? `u-${Date.now()}`,
        lastLogin: initial?.lastLogin ?? new Date().toISOString(),
        ...form,
      };
      onSave(saved);
      onClose();
    }, 500);
  }

  const rm = ROLE_META[form.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between shrink-0" style={{ background: 'linear-gradient(135deg,#f26522,#e05510)' }}>
          <div>
            <p className="text-orange-100 text-[10px] font-bold tracking-widest">{isEdit ? 'EDIT USER' : 'NEW USER'}</p>
            <h2 className="text-white font-black text-lg leading-tight mt-0.5">
              {isEdit ? initial!.name : 'Add System User'}
            </h2>
            <p className="text-orange-200 text-[11px] mt-0.5">
              {isEdit ? 'Update profile, role and branch access' : 'Register a new operator or admin'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl ml-4 mt-0.5 leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ayesha Malik"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Department *</label>
                <input
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  placeholder="e.g. ATM Services"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${
                    errors.department ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.department && <p className="text-[10px] text-red-500 mt-0.5">{errors.department}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="user@bop.com.pk"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Role</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(ROLE_META) as Role[]).map(r => {
                  const meta = ROLE_META[r];
                  const active = form.role === r;
                  return (
                    <button
                      key={r} type="button"
                      onClick={() => set('role', r)}
                      className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                        active ? meta.color + ' ring-1 ring-offset-1' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                <div className="flex gap-2">
                  {(['active','inactive','suspended'] as User['status'][]).map(s => {
                    const sm = STATUS_META[s];
                    return (
                      <button
                        key={s} type="button"
                        onClick={() => set('status', s)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          form.status === s
                            ? s === 'active'    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : s === 'suspended' ? 'bg-red-50 border-red-400 text-red-700'
                            : 'bg-gray-100 border-gray-400 text-gray-600'
                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                        {sm.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Branch Assignment */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                BRANCH ACCESS — {form.role === 'super_admin' ? 'All (Super Admin)' : `${form.branchIds.length} selected`}
              </p>
              {form.role === 'super_admin' ? (
                <div className="bg-bop-50 border border-bop-200 rounded-xl p-3 text-[12px] text-bop-700 font-semibold">
                  🌐 Super Admins automatically have access to all branches.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {ALL_BRANCHES.map(branch => {
                    const checked = form.branchIds.includes(branch.id);
                    return (
                      <label
                        key={branch.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          checked ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded accent-orange-500"
                          checked={checked}
                          onChange={() => toggleBranch(branch.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-[12px] font-semibold truncate ${ checked ? 'text-orange-700' : 'text-gray-700'}`}>{branch.name}</div>
                          <div className="text-[10px] text-gray-400">{branch.city}</div>
                        </div>
                        {checked && <span className="text-orange-500 shrink-0">✓</span>}
                      </label>
                    );
                  })}
                </div>
              )}
              {form.role !== 'super_admin' && (
                <div className="flex gap-3 mt-1.5">
                  <button type="button" onClick={() => set('branchIds', ALL_BRANCHES.map(b => b.id))} className="text-[11px] text-orange-600 font-semibold hover:underline">Select All</button>
                  <button type="button" onClick={() => set('branchIds', [])} className="text-[11px] text-gray-400 font-semibold hover:underline">Clear</button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#f26522,#e05510)', boxShadow: '0 4px 14px rgba(242,101,34,0.28)' }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  Saving…
                </span>
              ) : isEdit ? '✓ Save Changes' : `＋ Add ${form.name.trim() || 'User'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]           = useState<User[]>(INITIAL_USERS);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  function handleSaveBranches(userId: string, branchIds: string[]) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, branchIds } : u));
  }

  function handleSaveUser(u: User) {
    setUsers(prev => {
      const exists = prev.find(x => x.id === u.id);
      return exists ? prev.map(x => x.id === u.id ? u : x) : [u, ...prev];
    });
  }

  function handleDelete(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteId(null);
  }

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // KPIs
  const totalUsers   = users.length;
  const activeUsers  = users.filter(u => u.status === 'active').length;
  const adminCount   = users.filter(u => u.role === 'super_admin' || u.role === 'branch_admin').length;
  const unassigned   = users.filter(u => u.branchIds.length === 0).length;

  return (
    <>
      {assigningUser && (
        <BranchModal
          user={assigningUser}
          onSave={handleSaveBranches}
          onClose={() => setAssigningUser(null)}
        />
      )}
      {formOpen && (
        <UserFormModal
          initial={editTarget}
          onSave={handleSaveUser}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
        />
      )}
      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-base font-bold text-gray-800">Delete User?</h3>
            <p className="text-[12px] text-gray-500 mt-1 mb-5">This action cannot be undone. The user will lose all system access.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 rounded-xl text-white text-sm font-bold bg-red-500 hover:bg-red-600 shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">User Management</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Manage system users and assign branch access rights
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="flex items-center gap-2 bg-bop-600 hover:bg-bop-700 active:bg-bop-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <span className="text-base leading-none">＋</span>
            Add User
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Users',      value: totalUsers,  icon: '👥', accent: 'border-bop-500',    textColor: 'text-bop-700'    },
            { label: 'Active',           value: activeUsers, icon: '✅', accent: 'border-emerald-500', textColor: 'text-emerald-700' },
            { label: 'Admin Roles',      value: adminCount,  icon: '🛡️', accent: 'border-gold-500',   textColor: 'text-yellow-800'  },
            { label: 'Unassigned Users', value: unassigned,  icon: '⚠️', accent: 'border-orange-400', textColor: 'text-orange-600'  },
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

        {/* Info banner */}
        <div className="bg-bop-50 border border-bop-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-bop-600 text-lg shrink-0">🏦</span>
          <div>
            <p className="text-[12px] text-bop-700 font-semibold">Branch-Level Access Control</p>
            <p className="text-[11px] text-bop-600/80 mt-0.5">
              Each user can be tagged to one or more branches. Operators will only see ATMs and alerts
              belonging to their assigned branches. Super Admins have system-wide visibility.
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
                placeholder="Search by name, email or department…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bop-500/30 focus:border-bop-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'super_admin', 'branch_admin', 'supervisor', 'operator'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                    roleFilter === r
                      ? 'bg-bop-600 text-white border-bop-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-bop-300 hover:text-bop-600'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : ROLE_META[r].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-12 px-5 py-3 bg-bop-600 text-[10px] font-bold uppercase tracking-wider text-green-100 gap-3">
            <div className="col-span-3">User</div>
            <div className="col-span-2 hidden md:block">Role</div>
            <div className="col-span-4">Assigned Branches</div>
            <div className="col-span-2 hidden lg:block">Last Login</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No users match the current filter.
              </div>
            )}
            {filtered.map(user => {
              const sm = STATUS_META[user.status];
              const rm = ROLE_META[user.role];
              const assignedBranches = ALL_BRANCHES.filter(b => user.branchIds.includes(b.id));

              return (
                <div
                  key={user.id}
                  className="grid grid-cols-12 px-5 py-3.5 gap-3 items-center hover:bg-bop-50/30 transition-colors"
                >
                  {/* User */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      user.status === 'suspended' ? 'bg-gray-400' : 'bg-bop-600'
                    }`}>
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sm.dot}`} />
                        <span className={`text-[10px] font-medium ${sm.text}`}>{sm.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2 hidden md:block">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${rm.color}`}>
                      {rm.label}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">{user.department}</div>
                  </div>

                  {/* Branches */}
                  <div className="col-span-4 flex flex-wrap gap-1.5 items-center">
                    {user.role === 'super_admin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bop-600 text-white text-[10px] font-semibold">
                        🌐 All Branches
                      </span>
                    ) : assignedBranches.length === 0 ? (
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

                  {/* Last login */}
                  <div className="col-span-2 hidden lg:block text-[11px] text-gray-500">
                    {formatDate(user.lastLogin)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => { setEditTarget(user); setFormOpen(true); }}
                      title="Edit user"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-[11px] font-semibold transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteId(user.id)}
                      title="Delete user"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 text-[11px] font-semibold transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Showing {filtered.length} of {totalUsers} users
            </span>
            <span className="text-[11px] text-gray-400">
              {activeUsers} active · {totalUsers - activeUsers} inactive/suspended
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
