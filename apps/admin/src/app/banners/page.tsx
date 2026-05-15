'use client';
import { useState } from 'react';
import { mockAnnouncementBanners, AnnouncementBanner } from '@atm/shared';

const BOP_ORANGE = '#f26522';

const TYPE_CONFIG: Record<AnnouncementBanner['type'], { bg: string; text: string; border: string; icon: string; label: string }> = {
  info:        { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   icon: 'ℹ', label: 'Info'        },
  warning:     { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  icon: '⚠', label: 'Warning'     },
  promo:       { bg: '#fff4ee',       text: '#c2410c',         border: '#fed7aa',            icon: '★', label: 'Promo'       },
  maintenance: { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200',   icon: '⚙', label: 'Maintenance' },
};

const SCREEN_LABELS: Record<AnnouncementBanner['targetScreen'], string> = {
  home:        'Home Screen',
  atm_finder:  'ATM Finder',
  all_screens: 'All Screens',
};

const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'info' as AnnouncementBanner['type'],
  targetScreen: 'home' as AnnouncementBanner['targetScreen'],
  startsAt: '',
  endsAt: '',
  ctaLabel: '',
  ctaUrl: '',
  priority: 3,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function isLive(banner: AnnouncementBanner) {
  const now = Date.now();
  return banner.isActive
    && new Date(banner.startsAt).getTime() <= now
    && new Date(banner.endsAt).getTime() >= now;
}

export default function BannersPage() {
  const [banners, setBanners] = useState(mockAnnouncementBanners);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<AnnouncementBanner['type'] | 'all'>('all');

  const filtered = filterType === 'all' ? banners : banners.filter(b => b.type === filterType);
  const activeLive = banners.filter(isLive).length;
  const totalActive = banners.filter(b => b.isActive).length;

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowCreate(true);
  }

  function openEdit(b: AnnouncementBanner) {
    setEditId(b.id);
    setForm({
      title: b.title,
      message: b.message,
      type: b.type,
      targetScreen: b.targetScreen,
      startsAt: b.startsAt.slice(0, 16),
      endsAt: b.endsAt.slice(0, 16),
      ctaLabel: b.ctaLabel ?? '',
      ctaUrl: b.ctaUrl ?? '',
      priority: b.priority,
    });
    setShowCreate(true);
  }

  function handleSave() {
    if (!form.title.trim() || !form.message.trim() || !form.startsAt || !form.endsAt) return;
    const now = new Date().toISOString();
    if (editId) {
      setBanners(prev => prev.map(b => b.id === editId ? {
        ...b,
        title: form.title,
        message: form.message,
        type: form.type,
        targetScreen: form.targetScreen,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        ctaLabel: form.ctaLabel || undefined,
        ctaUrl: form.ctaUrl || undefined,
        priority: form.priority,
      } : b));
    } else {
      const newBanner: AnnouncementBanner = {
        id: `banner-${Date.now()}`,
        title: form.title,
        message: form.message,
        type: form.type,
        isActive: true,
        priority: form.priority,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        targetScreen: form.targetScreen,
        ctaLabel: form.ctaLabel || undefined,
        ctaUrl: form.ctaUrl || undefined,
        createdAt: now,
        createdBy: 'Admin User',
      };
      setBanners(prev => [newBanner, ...prev]);
    }
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setEditId(null);
  }

  function toggleActive(id: string) {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  }

  function handleDelete(id: string) {
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Announcement Banners</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage in-app banners shown to mobile users on specific screens</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: BOP_ORANGE }}
        >
          <span className="text-base leading-none">＋</span>
          New Banner
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Live Now',       value: activeLive,       sub: 'currently showing',  color: '#15803d' },
          { label: 'Active',         value: totalActive,      sub: 'enabled banners',    color: BOP_ORANGE },
          { label: 'Total Banners',  value: banners.length,   sub: 'all time',           color: '#1d1d1f' },
          { label: 'Inactive',       value: banners.length - totalActive, sub: 'disabled', color: '#999'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="text-xl font-black" style={{ color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            <div className="text-[11px] font-bold text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filter ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {(['all', 'info', 'warning', 'promo', 'maintenance'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={filterType === t
              ? { background: BOP_ORANGE, color: '#fff' }
              : { background: '#f5f5f7', color: '#555' }
            }
          >
            {t === 'all' ? 'All' : TYPE_CONFIG[t as AnnouncementBanner['type']].label}
            <span className="ml-1.5 opacity-70">
              ({t === 'all' ? banners.length : banners.filter(b => b.type === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Banner cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 py-14 text-center text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
            No banners found.
          </div>
        )}
        {filtered
          .sort((a, b) => a.priority - b.priority)
          .map(banner => {
            const cfg = TYPE_CONFIG[banner.type];
            const live = isLive(banner);
            return (
              <div
                key={banner.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                style={{ opacity: banner.isActive ? 1 : 0.6 }}
              >
                {/* Banner preview strip */}
                <div
                  className={`px-4 py-3 flex items-start gap-3 border-b ${cfg.border}`}
                  style={banner.type === 'promo'
                    ? { background: cfg.bg, borderColor: cfg.border }
                    : {}
                  }
                >
                  <span
                    className={`text-lg leading-none mt-0.5 ${banner.type !== 'promo' ? cfg.text : ''}`}
                    style={banner.type === 'promo' ? { color: cfg.text } : {}}
                  >
                    {cfg.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-bold leading-tight ${banner.type !== 'promo' ? cfg.text : ''}`}
                      style={banner.type === 'promo' ? { color: cfg.text } : {}}
                    >
                      {banner.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 leading-snug">{banner.message}</div>
                    {banner.ctaLabel && (
                      <span
                        className="inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded"
                        style={{ background: BOP_ORANGE, color: '#fff' }}
                      >
                        {banner.ctaLabel} →
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-wide">{cfg.label}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">{SCREEN_LABELS[banner.targetScreen]}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">Priority {banner.priority}</span>
                    {live && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {!banner.isActive && (
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">INACTIVE</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>{fmtDate(banner.startsAt)} → {fmtDate(banner.endsAt)}</span>
                    <span>by {banner.createdBy}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(banner.id)}
                    className="flex items-center gap-2 text-xs font-bold transition-colors"
                    style={{ color: banner.isActive ? '#15803d' : '#999' }}
                  >
                    <div
                      className="w-8 h-4 rounded-full relative transition-colors"
                      style={{ background: banner.isActive ? '#86efac' : '#d1d5db' }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
                        style={{ left: banner.isActive ? '17px' : '1px' }}
                      />
                    </div>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(banner)}
                      className="px-2.5 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Create / Edit modal ─────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderBottom: `2px solid ${BOP_ORANGE}20` }}>
              <div>
                <h2 className="text-sm font-black text-gray-900">{editId ? 'Edit Banner' : 'Create Announcement Banner'}</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Shown inside the mobile app on the selected screen</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Banner Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={60}
                  placeholder="Short, attention-grabbing title"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1"
                />
                <div className="text-right text-[10px] text-gray-400 mt-0.5">{form.title.length}/60</div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  maxLength={200}
                  rows={3}
                  placeholder="Full message shown inside the banner…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1"
                />
                <div className="text-right text-[10px] text-gray-400 mt-0.5">{form.message.length}/200</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as AnnouncementBanner['type'] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    {(Object.keys(TYPE_CONFIG) as AnnouncementBanner['type'][]).map(t => (
                      <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Target Screen</label>
                  <select
                    value={form.targetScreen}
                    onChange={e => setForm(f => ({ ...f, targetScreen: e.target.value as AnnouncementBanner['targetScreen'] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    {(Object.keys(SCREEN_LABELS) as AnnouncementBanner['targetScreen'][]).map(s => (
                      <option key={s} value={s}>{SCREEN_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Starts At *</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Ends At *</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Display Priority (1 = highest)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Call to Action (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Button Label</label>
                    <input
                      value={form.ctaLabel}
                      onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))}
                      placeholder="e.g. Learn More"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">URL</label>
                    <input
                      value={form.ctaUrl}
                      onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))}
                      placeholder="https://…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || !form.message.trim() || !form.startsAt || !form.endsAt}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40"
                style={{ background: BOP_ORANGE }}
              >
                {editId ? '✓ Save Changes' : '＋ Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
