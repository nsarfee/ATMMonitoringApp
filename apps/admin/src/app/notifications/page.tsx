'use client';
import { useState } from 'react';
import { mockBroadcastNotifications, BroadcastNotification } from '@atm/shared';

const BOP_ORANGE = '#f26522';

const CHANNEL_LABELS: Record<BroadcastNotification['channel'], string> = {
  push:   'Push Only',
  in_app: 'In-App Only',
  both:   'Push + In-App',
};

const STATUS_STYLES: Record<BroadcastNotification['status'], { bg: string; text: string; dot: string }> = {
  sent:      { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  scheduled: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  draft:     { bg: 'bg-gray-100',   text: 'text-gray-600',    dot: 'bg-gray-400'    },
  failed:    { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
};

const AUDIENCE_OPTIONS = [
  { value: 'all',          label: 'All App Users'     },
  { value: 'app_users',    label: 'Mobile App Users'  },
  { value: 'branch_users', label: 'Branch Users'      },
  { value: 'custom',       label: 'Custom Segment'    },
];

const CHANNEL_OPTIONS = [
  { value: 'push',   label: 'Push Notification' },
  { value: 'in_app', label: 'In-App Message'    },
  { value: 'both',   label: 'Push + In-App'     },
];

const EMPTY_FORM = {
  title: '',
  body: '',
  audience: 'all' as BroadcastNotification['audience'],
  channel: 'both' as BroadcastNotification['channel'],
  schedule: 'now' as 'now' | 'later',
  scheduledFor: '',
};

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockBroadcastNotifications);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<BroadcastNotification['status'] | 'all'>('all');
  const [preview, setPreview] = useState<BroadcastNotification | null>(null);

  const filtered = filterStatus === 'all'
    ? notifications
    : notifications.filter(n => n.status === filterStatus);

  const sentTotal = notifications.filter(n => n.status === 'sent').reduce((s, n) => s + (n.sentCount ?? 0), 0);
  const scheduled = notifications.filter(n => n.status === 'scheduled').length;
  const drafts    = notifications.filter(n => n.status === 'draft').length;

  function handleSend() {
    if (!form.title.trim() || !form.body.trim()) return;
    const now = new Date().toISOString();
    const audLabel = AUDIENCE_OPTIONS.find(a => a.value === form.audience)?.label ?? 'All App Users';
    const newNotif: BroadcastNotification = {
      id: `notif-${Date.now()}`,
      title: form.title,
      body: form.body,
      audience: form.audience,
      audienceLabel: audLabel,
      channel: form.channel,
      status: form.schedule === 'now' ? 'sent' : 'scheduled',
      sentAt: form.schedule === 'now' ? now : undefined,
      scheduledFor: form.schedule === 'later' && form.scheduledFor ? new Date(form.scheduledFor).toISOString() : undefined,
      createdAt: now,
      sentCount: form.schedule === 'now' ? 0 : undefined,
      createdBy: 'Admin User',
    };
    setNotifications(prev => [newNotif, ...prev]);
    setForm(EMPTY_FORM);
    setShowCompose(false);
  }

  function handleSaveDraft() {
    if (!form.title.trim()) return;
    const audLabel = AUDIENCE_OPTIONS.find(a => a.value === form.audience)?.label ?? 'All App Users';
    const draft: BroadcastNotification = {
      id: `notif-${Date.now()}`,
      title: form.title,
      body: form.body,
      audience: form.audience,
      audienceLabel: audLabel,
      channel: form.channel,
      status: 'draft',
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
    };
    setNotifications(prev => [draft, ...prev]);
    setForm(EMPTY_FORM);
    setShowCompose(false);
  }

  function handleDelete(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (preview?.id === id) setPreview(null);
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Broadcast Notifications</h1>
          <p className="text-xs text-gray-400 mt-0.5">Compose and send push/in-app messages to mobile app users</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: BOP_ORANGE }}
        >
          <span className="text-base leading-none">✦</span>
          New Notification
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Sent',     value: sentTotal.toLocaleString(), sub: 'cumulative reach', color: '#15803d'   },
          { label: 'Scheduled',      value: scheduled,                   sub: 'queued to send',  color: '#1d4ed8'   },
          { label: 'Drafts',         value: drafts,                      sub: 'not yet sent',    color: '#92400e'   },
          { label: 'Notifications',  value: notifications.length,        sub: 'all time',        color: '#1d1d1f'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <div className="text-xl font-black" style={{ color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            <div className="text-[11px] font-bold text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-gray-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {(['all', 'sent', 'scheduled', 'draft', 'failed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={filterStatus === s
              ? { background: BOP_ORANGE, color: '#fff' }
              : { background: '#f5f5f7', color: '#555' }
            }
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 opacity-70">
              ({s === 'all' ? notifications.length : notifications.filter(n => n.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Notifications list ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-gray-400">No notifications found.</div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Notification', 'Audience', 'Channel', 'Status', 'Sent / Scheduled', 'Reach', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(n => {
                const s = STATUS_STYLES[n.status];
                return (
                  <tr key={n.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="font-bold text-gray-900 truncate">{n.title}</div>
                      <div className="text-gray-400 truncate mt-0.5">{n.body}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{n.audienceLabel}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">{CHANNEL_LABELS[n.channel]}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {n.status === 'scheduled' ? fmtDate(n.scheduledFor) : fmtDate(n.sentAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-gray-700">
                      {n.sentCount !== undefined ? n.sentCount.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreview(n)}
                          className="px-2.5 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          View
                        </button>
                        {(n.status === 'draft' || n.status === 'scheduled') && (
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Compose modal ──────────────────────────────────────── */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: '#fff4ee' }}>
              <div>
                <h2 className="text-sm font-black text-gray-900">Compose Notification</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Send to mobile app users in real-time</p>
              </div>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  maxLength={80}
                  placeholder="Short, clear heading for the notification"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': BOP_ORANGE } as React.CSSProperties}
                />
                <div className="text-right text-[10px] text-gray-400 mt-0.5">{form.title.length}/80</div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Message Body *</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  maxLength={250}
                  rows={3}
                  placeholder="Notification message shown to users…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': BOP_ORANGE } as React.CSSProperties}
                />
                <div className="text-right text-[10px] text-gray-400 mt-0.5">{form.body.length}/250</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Audience</label>
                  <select
                    value={form.audience}
                    onChange={e => setForm(f => ({ ...f, audience: e.target.value as BroadcastNotification['audience'] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    {AUDIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Channel</label>
                  <select
                    value={form.channel}
                    onChange={e => setForm(f => ({ ...f, channel: e.target.value as BroadcastNotification['channel'] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    {CHANNEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Send Timing</label>
                <div className="flex gap-2">
                  {[{ v: 'now', l: 'Send Now' }, { v: 'later', l: 'Schedule' }].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setForm(f => ({ ...f, schedule: opt.v as 'now' | 'later' }))}
                      className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                      style={form.schedule === opt.v
                        ? { background: BOP_ORANGE, color: '#fff', borderColor: BOP_ORANGE }
                        : { background: '#f5f5f7', color: '#555', borderColor: '#e5e5ea' }
                      }
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              {form.schedule === 'later' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-gray-600 mb-1">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={e => setForm(f => ({ ...f, scheduledFor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={handleSend}
                disabled={!form.title.trim() || !form.body.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-40"
                style={{ background: BOP_ORANGE }}
              >
                {form.schedule === 'now' ? '▶ Send Now' : '⏱ Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview modal ──────────────────────────────────────── */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-900">Notification Detail</h2>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Phone mock */}
              <div className="mx-auto w-56 rounded-2xl border-4 border-gray-800 overflow-hidden shadow-lg">
                <div className="bg-gray-800 text-center py-1">
                  <div className="w-12 h-1 rounded-full bg-gray-600 mx-auto" />
                </div>
                <div className="bg-gray-100 p-3">
                  <div className="bg-white rounded-xl shadow-sm p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black text-white" style={{ background: BOP_ORANGE }}>B</div>
                      <span className="text-[9px] font-bold text-gray-500">BOP · now</span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-900 leading-tight">{preview.title}</div>
                    <div className="text-[10px] text-gray-500 mt-1 leading-tight">{preview.body}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ['Status',    preview.status.charAt(0).toUpperCase() + preview.status.slice(1)],
                  ['Audience',  preview.audienceLabel],
                  ['Channel',   CHANNEL_LABELS[preview.channel]],
                  ['Created by', preview.createdBy],
                  ['Created',   fmtDate(preview.createdAt)],
                  ...(preview.sentAt       ? [['Sent',      fmtDate(preview.sentAt)]]       : []),
                  ...(preview.scheduledFor ? [['Scheduled', fmtDate(preview.scheduledFor)]] : []),
                  ...(preview.sentCount !== undefined ? [['Reach', preview.sentCount.toLocaleString() + ' users']] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500 font-semibold">{k}</span>
                    <span className="text-gray-900 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
