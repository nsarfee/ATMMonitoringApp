import { mockATMs, mockAlerts } from '@atm/shared';
import { INCIDENTS, PRIORITY_CFG, slaInfo } from '@/lib/incidents';
import Link from 'next/link';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DEVICE_LABELS: Record<string, string> = {
  cardReader: 'CRD', printer: 'PRT', display: 'DSP', pinpad: 'PIN', cashDispenser: 'CSH',
};

function DeviceGrid({ devices }: { devices: Record<string, string> }) {
  return (
    <div className="flex gap-1 mt-1">
      {Object.entries(devices).map(([key, state]) => (
        <span
          key={key}
          className="text-[7px] font-black px-1 py-0.5 rounded"
          style={{
            background: state === 'error' ? '#fff1f0' : state === 'warning' ? '#fffbeb' : '#f0fdf4',
            color:      state === 'error' ? '#dc2626' : state === 'warning' ? '#d97706' : '#15803d',
          }}
        >
          {DEVICE_LABELS[key] ?? key.slice(0,3).toUpperCase()}
        </span>
      ))}
    </div>
  );
}

function PanelHeader({ title, count, href, alert = false }: { title: string; count?: number; href?: string; alert?: boolean }) {
  return (
    <div
      className="px-4 py-2.5 flex items-center justify-between"
      style={{ background: '#ffffff', borderBottom: '1px solid #333' }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${alert ? '' : 'animate-pulse'}`}
          style={{ background: alert ? '#f26522' : '#00cc66' }}
        />
        <span className="text-[9px] font-black tracking-widest" style={{ color: '#6b6b6b' }}>
          {title}
          {count !== undefined && (
            <span className="ml-2" style={{ color: alert ? '#f26522' : '#444' }}>· {count}</span>
          )}
        </span>
      </div>
      {href && (
        <Link href={href} className="text-[9px] font-bold" style={{ color: '#999' }}>
          VIEW ALL →
        </Link>
      )}
    </div>
  );
}

// ── ATM status display config ─────────────────────────────────────────────────
const ATM_STATUS_CFG: Record<string, { dot: string; label: string; rowBg: string; barColor: string }> = {
  online:      { dot: '#22c55e', label: 'ONLINE',   rowBg: '#f0fdf4', barColor: '#22c55e' },
  offline:     { dot: '#f26522', label: 'OFFLINE',  rowBg: '#fff4ee', barColor: '#f26522' },
  warning:     { dot: '#f59e0b', label: 'WARN',     rowBg: '#fffbeb', barColor: '#f59e0b' },
  cash_low:    { dot: '#ea580c', label: 'LOW CASH', rowBg: '#fff7f0', barColor: '#ea580c' },
  maintenance: { dot: '#999999', label: 'MAINT',    rowBg: '#f9f9fb', barColor: '#aaaaaa' },
};

export default function DashboardPage() {
  // ── Fleet metrics ────────────────────────────────────────────────────────
  const total       = mockATMs.length;
  const online      = mockATMs.filter(a => a.status === 'online').length;
  const offline     = mockATMs.filter(a => a.status === 'offline').length;
  const cashLow     = mockATMs.filter(a => a.status === 'cash_low').length;
  const warning     = mockATMs.filter(a => a.status === 'warning').length;
  const avgCash     = Math.round(mockATMs.reduce((s, a) => s + a.cashLevel, 0) / total);
  const uptimePct   = Math.round((online / total) * 100);

  // ── Incident metrics ─────────────────────────────────────────────────────
  const openInc     = INCIDENTS.filter(i => !['resolved', 'closed'].includes(i.status));
  const critInc     = openInc.filter(i => i.priority === 'critical');
  const breachedInc = openInc.filter(i => new Date(i.slaDeadlineAt) < new Date());

  // ── Alert metrics ────────────────────────────────────────────────────────
  const activeAlerts = mockAlerts.filter(a => !a.resolved);
  const critAlerts   = activeAlerts.filter(a => a.severity === 'critical');

  // ── Live event stream ────────────────────────────────────────────────────
  const allEvents = mockATMs
    .flatMap(atm => (atm.events ?? []).map(e => ({ ...e, atmName: atm.name })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // ── Incident pipeline counts ─────────────────────────────────────────────
  const pipeline = {
    new:         INCIDENTS.filter(i => i.status === 'new').length,
    assigned:    INCIDENTS.filter(i => i.status === 'assigned').length,
    in_progress: INCIDENTS.filter(i => i.status === 'in_progress').length,
    resolved:    INCIDENTS.filter(i => i.status === 'resolved').length,
    closed:      INCIDENTS.filter(i => i.status === 'closed').length,
  };
  const maxPipeline = Math.max(...Object.values(pipeline), 1);

  const systemOk = offline === 0 && critInc.length === 0 && critAlerts.length === 0;
  const now = new Date();

  return (
    <div className="p-3 space-y-3" style={{ minHeight: '100%' }}>

      {/* ── System status banner ──────────────────────────────────────────── */}
      <div
        className="px-4 py-2 rounded flex items-center justify-between"
        style={{
          background: systemOk ? '#edfaf3' : '#fff4ee',
          border: `1px solid ${systemOk ? '#b6e8cc' : '#fdd0b3'}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full animate-pulse ${systemOk ? 'bg-emerald-400' : 'bg-red-500'}`} />
          <span
            className="text-[10px] font-black tracking-widest"
            style={{ color: systemOk ? '#15803d' : '#f26522' }}
          >
            {systemOk
              ? 'SYSTEM STATUS: ALL OPERATIONS NOMINAL'
              : `SYSTEM ALERT: ${offline > 0 ? `${offline} ATM${offline > 1 ? 'S' : ''} OFFLINE` : ''} ${critInc.length > 0 ? `· ${critInc.length} CRITICAL INCIDENT${critInc.length > 1 ? 'S' : ''}` : ''} ${breachedInc.length > 0 ? `· ${breachedInc.length} SLA BREACH${breachedInc.length > 1 ? 'ES' : ''}` : ''}`.trim()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-bold tracking-wider" style={{ color: '#999' }}>
            {now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} PKT
          </span>
          <Link
            href="/atms"
            className="text-[9px] font-black px-2 py-0.5 rounded"
            style={{ background: '#0d1a28', color: '#3a6a8a' }}
          >
            FLEET →
          </Link>
        </div>
      </div>

      {/* ── KPI metrics strip ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {[
          { label: 'TOTAL ATMs', value: String(total),       color: '#1d1d1f'                                        },
          { label: 'ONLINE',     value: String(online),      color: '#22c55e'                                        },
          { label: 'OFFLINE',   value: String(offline),     color: offline > 0 ? '#f26522' : '#3a3a3a'              },
          { label: 'CASH LOW',   value: String(cashLow),     color: cashLow > 0 ? '#ff8c00' : '#ccc'              },
          { label: 'WARNING',    value: String(warning),     color: warning > 0 ? '#f59e0b' : '#ccc'              },
          { label: 'AVG CASH',   value: `${avgCash}%`,       color: avgCash < 30 ? '#f26522' : avgCash < 50 ? '#ffaa00' : '#00cc66' },
          { label: 'INCIDENTS',  value: String(openInc.length), color: openInc.length > 0 ? '#f59e0b' : '#ccc'   },
          { label: 'UPTIME',     value: `${uptimePct}%`,     color: uptimePct >= 90 ? '#00cc66' : uptimePct >= 70 ? '#ffaa00' : '#f26522' },
        ].map(k => (
          <div
            key={k.label}
            className="rounded px-2 py-2.5 text-center"
            style={{ background: '#ffffff', border: '1px solid #e5e5ea' }}
          >
            <div className="text-lg font-black leading-none" style={{ color: k.color, fontFamily: 'monospace' }}>
              {k.value}
            </div>
            <div className="text-[7px] font-black tracking-widest mt-1" style={{ color: '#999' }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main two-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">

        {/* LEFT — 3 columns ──────────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-3">

          {/* ATM Health Matrix */}
          <div className="rounded overflow-hidden" style={{ border: '1px solid #333' }}>
            <PanelHeader title="ATM HEALTH MATRIX" href="/atms" />
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ background: '#fafafa' }}
            >
              {mockATMs.map(atm => {
                const sc = ATM_STATUS_CFG[atm.status] ?? ATM_STATUS_CFG.online;
                const lastSeenMin = Math.round((Date.now() - new Date(atm.lastSeen).getTime()) / 60000);
                const devErrors = Object.values(atm.devices).filter(d => d === 'error').length;
                const devWarns  = Object.values(atm.devices).filter(d => d === 'warning').length;
                const linkedInc = INCIDENTS.filter(i => i.atmName === atm.name && !['resolved','closed'].includes(i.status));

                return (
                  <Link
                    key={atm.id}
                    href="/atms"
                    className="block px-4 py-3 transition-colors"
                    style={{ background: sc.rowBg, borderBottom: '1px solid #f0f0f2', borderRight: '1px solid #f0f0f2' }}
                  >
                    {/* Name + status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold truncate" style={{ color: '#1d1d1f' }}>
                        {atm.name.replace('ATM ', '')}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${atm.status !== 'offline' ? 'animate-pulse' : ''}`}
                          style={{ background: sc.dot }}
                        />
                        <span className="text-[8px] font-black tracking-wider" style={{ color: sc.dot }}>
                          {sc.label}
                        </span>
                      </div>
                    </div>

                    {/* Cash bar */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#e5e5ea' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${atm.cashLevel}%`, background: sc.barColor }}
                        />
                      </div>
                      <span className="text-[9px] font-black w-8 text-right" style={{ color: '#6b6b6b', fontFamily: 'monospace' }}>
                        {atm.cashLevel}%
                      </span>
                    </div>

                    {/* Device dots + meta */}
                    <div className="flex items-center justify-between">
                      <DeviceGrid devices={atm.devices} />
                      <div className="flex items-center gap-2">
                        {linkedInc.length > 0 && (
                          <span
                            className="text-[7px] font-black px-1 py-0.5 rounded"
                            style={{ background: '#fff4ee', color: '#f26522' }}
                          >
                            {linkedInc.length} INC
                          </span>
                        )}
                        {devErrors > 0 && (
                          <span className="text-[7px] font-black" style={{ color: '#ff5555' }}>
                            {devErrors} ERR
                          </span>
                        )}
                        {devWarns > 0 && (
                          <span className="text-[7px] font-black" style={{ color: '#ffaa33' }}>
                            {devWarns} WRN
                          </span>
                        )}
                        <span className="text-[8px]" style={{ color: '#999', fontFamily: 'monospace' }}>
                          {lastSeenMin < 60 ? `${lastSeenMin}m` : `${Math.round(lastSeenMin / 60)}h`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Live Event Stream */}
          <div className="rounded overflow-hidden" style={{ border: '1px solid #333' }}>
            <PanelHeader title="LIVE EVENT STREAM" />
            <div style={{ background: '#ffffff' }}>
              {allEvents.length === 0 && (
                <div className="px-4 py-6 text-center text-[9px] font-bold" style={{ color: '#bbb' }}>
                  NO EVENTS
                </div>
              )}
              {allEvents.map((evt, i) => {
                const isErr  = evt.type === 'error';
                const isWarn = evt.type === 'warning';
                const typeColor  = isErr ? '#dc2626' : isWarn ? '#d97706' : '#15803d';
                const typeLabel  = isErr ? 'ERR' : isWarn ? 'WRN' : 'INF';
                const typeBg     = isErr ? '#fff1f0' : isWarn ? '#fffbeb' : '#f0fdf4';
                const ago        = Date.now() - new Date(evt.timestamp).getTime();
                const agoStr     = ago < 3600000 ? `${Math.round(ago / 60000)}m` : `${Math.round(ago / 3600000)}h`;

                return (
                  <div
                    key={`${evt.id}-${i}`}
                    className="flex items-start gap-3 px-4 py-2"
                    style={{ borderBottom: '1px solid #f0f0f2' }}
                  >
                    <span
                      className="text-[7px] font-black px-1 py-0.5 rounded shrink-0 mt-0.5"
                      style={{ background: typeBg, color: typeColor }}
                    >
                      {typeLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold" style={{ color: '#999' }}>
                        {evt.atmName.replace('ATM ', '')}
                      </span>
                      <span className="text-[10px] ml-1.5" style={{ color: '#888' }}>
                        {evt.message}
                      </span>
                    </div>
                    <span className="text-[9px] shrink-0" style={{ color: '#999', fontFamily: 'monospace' }}>
                      {agoStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — 2 columns ─────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-3">

          {/* Active Alerts */}
          <div
            className="rounded overflow-hidden"
            style={{ border: `1px solid ${critAlerts.length > 0 ? '#4a2000' : '#333'}` }}
          >
            <PanelHeader
              title="ACTIVE ALERTS"
              count={activeAlerts.length}
              href="/alerts"
              alert={critAlerts.length > 0}
            />
            <div style={{ background: '#ffffff' }}>
              {activeAlerts.length === 0 ? (
                <div className="px-4 py-6 text-center text-[9px] font-bold" style={{ color: '#bbb' }}>
                  NO ACTIVE ALERTS
                </div>
              ) : activeAlerts.map(alert => {
                const sc = {
                  critical: { color: '#f26522', bg: '#fff4ee', border: '#fdd0b3', label: 'CRIT' },
                  high:     { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'HIGH' },
                  medium:   { color: '#b45309', bg: '#fefce8', border: '#fde68a', label: 'MED'  },
                  low:      { color: '#999', bg: '#f9f9fb', border: '#e5e5ea',    label: 'LOW'  },
                }[alert.severity] ?? { color: '#999', bg: '#f9f9fb', border: '#e5e5ea', label: '??' };
                const ago = Date.now() - new Date(alert.timestamp).getTime();
                const agoStr = ago < 3600000 ? `${Math.round(ago / 60000)}m` : `${Math.round(ago / 3600000)}h`;

                return (
                  <div
                    key={alert.id}
                    className="px-3 py-2.5 flex items-start gap-2.5"
                    style={{ background: sc.bg, borderBottom: `1px solid ${sc.border}` }}
                  >
                    <span
                      className="text-[7px] font-black px-1 py-0.5 rounded shrink-0 mt-0.5"
                      style={{ background: sc.border, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold truncate" style={{ color: '#1d1d1f' }}>
                        {alert.atmName}
                      </div>
                      <div className="text-[9px] mt-0.5 line-clamp-1" style={{ color: '#6b6b6b' }}>
                        {alert.message}
                      </div>
                    </div>
                    <span className="text-[8px] shrink-0" style={{ color: '#888', fontFamily: 'monospace' }}>
                      {agoStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Pipeline */}
          <div className="rounded overflow-hidden" style={{ border: '1px solid #333' }}>
            <PanelHeader title="INCIDENT PIPELINE" href="/tickets" />
            <div className="p-3 space-y-1.5" style={{ background: '#ffffff' }}>
              {([
                { key: 'new',         label: 'NEW',         color: '#f26522', bg: '#fff4ee' },
                { key: 'assigned',    label: 'ASSIGNED',    color: '#d97706', bg: '#fffbeb' },
                { key: 'in_progress', label: 'IN PROGRESS', color: '#ea580c', bg: '#fff4ee' },
                { key: 'resolved',    label: 'RESOLVED',    color: '#15803d', bg: '#f0fdf4' },
                { key: 'closed',      label: 'CLOSED',      color: '#888',    bg: '#f5f5f7' },
              ] as const).map(stage => {
                const count = pipeline[stage.key];
                return (
                  <div
                    key={stage.key}
                    className="flex items-center gap-2.5 px-3 py-2 rounded"
                    style={{ background: stage.bg, border: `1px solid ${stage.bg}` }}
                  >
                    <span
                      className="text-[8px] font-black w-20 tracking-wider shrink-0"
                      style={{ color: stage.color }}
                    >
                      {stage.label}
                    </span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#e5e5ea' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(count / maxPipeline) * 100}%`, background: stage.color, opacity: 0.7 }}
                      />
                    </div>
                    <span
                      className="text-sm font-black w-4 text-right shrink-0"
                      style={{ color: stage.color, fontFamily: 'monospace' }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Incidents */}
          <div className="rounded overflow-hidden" style={{ border: '1px solid #333' }}>
            <PanelHeader title="OPEN INCIDENTS" count={openInc.length} href="/tickets" alert={critInc.length > 0} />
            <div style={{ background: '#ffffff' }}>
              {openInc.length === 0 ? (
                <div className="px-4 py-6 text-center text-[9px] font-bold" style={{ color: '#bbb' }}>
                  NO OPEN INCIDENTS
                </div>
              ) : openInc.slice(0, 6).map(inc => {
                const pc  = PRIORITY_CFG[inc.priority];
                const sla = slaInfo(inc);
                const ago = Date.now() - new Date(inc.reportedAt).getTime();
                const agoStr = ago < 3600000 ? `${Math.round(ago / 60000)}m` : `${Math.round(ago / 3600000)}h`;

                const priorityColor = {
                  critical: '#f26522', high: '#ffaa00', medium: '#ffcc44', low: '#888',
                }[inc.priority] ?? '#888';

                return (
                  <div
                    key={inc.id}
                    className="px-3 py-2.5 flex items-start gap-2.5"
                    style={{ borderBottom: '1px solid #f0f0f2' }}
                  >
                    <span
                      className="text-[7px] font-black px-1 py-0.5 rounded shrink-0 mt-0.5"
                      style={{ background: '#fff4ee', color: priorityColor }}
                    >
                      {inc.priority.slice(0, 4).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black" style={{ color: '#f26522', fontFamily: 'monospace' }}>
                          {inc.id}
                        </span>
                        <span className="text-[9px]" style={{ color: '#999' }}>·</span>
                        <span className="text-[9px] truncate" style={{ color: '#c0c4c8' }}>
                          {inc.atmName.replace('ATM ', '')}
                        </span>
                      </div>
                      <div className="text-[8px] mt-0.5" style={{ color: '#888' }}>
                        {inc.type.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-[8px] font-black"
                        style={{ color: sla.breached ? '#f26522' : '#555' }}
                      >
                        {sla.label}
                      </div>
                      <div className="text-[8px]" style={{ color: '#888', fontFamily: 'monospace' }}>
                        {agoStr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

