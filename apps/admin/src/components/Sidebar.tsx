'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mockATMs } from '@atm/shared';

const openIncidents = 3;
const offlineATMs   = mockATMs.filter(a => a.status === 'offline').length;
const onlineATMs    = mockATMs.filter(a => a.status === 'online').length;
const faultATMs     = mockATMs.filter(a => ['offline','warning','cash_low'].includes(a.status)).length;

// BOP brand colors — light theme
const BOP_ORANGE = '#f26522';
const BOP_DARK   = '#ffffff';
const BOP_PANEL  = '#f5f5f7';
const BOP_BORDER = '#e5e5ea';

const navItems = [
  { href: '/',               label: 'Operations Center', icon: '◈', badge: null,                                    section: 'CONTROL'   },
  { href: '/atms',           label: 'ATM Fleet',          icon: '⬡', badge: offlineATMs > 0 ? offlineATMs : null,    section: 'CONTROL'   },
  { href: '/tickets',        label: 'Incident Mgmt',      icon: '⚠', badge: openIncidents > 0 ? openIncidents : null, section: 'CONTROL'  },
  { href: '/users',          label: 'User Access',        icon: '◉', badge: null,                                    section: 'ADMIN'     },
  { href: '/vendors',        label: 'Vendor SLA',         icon: '⋯', badge: null,                                    section: 'ADMIN'     },
  { href: '/notifications',  label: 'Broadcast Notifs',   icon: '◎', badge: null,                                    section: 'APP COMMS' },
  { href: '/banners',        label: 'Announcement Banners', icon: '▣', badge: null,                                  section: 'APP COMMS' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 flex flex-col shrink-0 select-none"
      style={{ background: BOP_DARK, borderRight: `1px solid ${BOP_BORDER}` }}
    >
      {/* ── Identity ──────────────────────────────────────────────── */}
      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${BOP_BORDER}` }}>
        {/* BOP logo bar */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-black text-[11px] shrink-0"
            style={{ background: BOP_ORANGE, color: '#fff' }}
          >
            BOP
          </div>
          <div>
            <div className="text-[12px] font-bold leading-tight" style={{ color: '#1d1d1f' }}>ATM Control</div>
            <div className="text-[9px] font-bold tracking-widest leading-tight" style={{ color: BOP_ORANGE }}>
              THE BANK OF PUNJAB
            </div>
          </div>
        </div>

        {/* System status strip — orange when issue, green when ok */}
        {offlineATMs > 0 || openIncidents > 0 ? (
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded"
            style={{ background: '#fff4ee', border: `1px solid ${BOP_ORANGE}40` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: BOP_ORANGE }} />
            <span className="text-[9px] font-black tracking-widest" style={{ color: BOP_ORANGE }}>
              {offlineATMs > 0 ? `${offlineATMs} ATM OFFLINE` : `${openIncidents} INCIDENTS OPEN`}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded"
            style={{ background: '#edfaf3', border: '1px solid #b6e8cc' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[9px] font-black tracking-widest" style={{ color: '#15803d' }}>SYSTEMS NOMINAL</span>
          </div>
        )}
      </div>

      {/* ── Fleet Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1 mx-3 mt-3">
        {[
          { label: 'TOTAL',  value: mockATMs.length, color: '#1d1d1f' },
          { label: 'ONLINE', value: onlineATMs,       color: '#15803d' },
          { label: 'FAULT',  value: faultATMs,        color: faultATMs > 0 ? BOP_ORANGE : '#aaa' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded text-center py-2"
            style={{ background: BOP_PANEL, border: `1px solid ${BOP_BORDER}` }}
          >
            <div className="text-sm font-black" style={{ color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            <div className="text-[8px] font-bold tracking-wider mt-0.5" style={{ color: '#999' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5">
        {(['CONTROL', 'ADMIN', 'APP COMMS'] as const).map(section => (
          <div key={section}>
            <p className="px-2 pt-1 pb-1.5 text-[8px] font-black tracking-[0.18em]" style={{ color: '#bbb' }}>
              {section}
            </p>
            {navItems.filter(i => i.section === section).map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-2.5 py-2 rounded text-[12px] font-semibold transition-all duration-100"
                  style={{
                    background: isActive ? '#fff4ee' : 'transparent',
                    color:      isActive ? BOP_ORANGE : '#555',
                    borderLeft: isActive ? `2px solid ${BOP_ORANGE}` : '2px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '11px', opacity: isActive ? 1 : 0.4 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className="min-w-[16px] h-[16px] px-1 rounded text-[9px] font-black text-white flex items-center justify-center"
                      style={{ background: '#cc2200' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div className="mx-3 my-2" style={{ height: '1px', background: BOP_BORDER }} />

      {/* ── User footer ───────────────────────────────────────────── */}
      <div
        className="mx-3 mb-3 px-3 py-2.5 rounded"
        style={{ background: BOP_PANEL, border: `1px solid ${BOP_BORDER}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
            style={{ background: BOP_ORANGE }}
          >
            AU
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold leading-tight" style={{ color: '#1d1d1f' }}>Admin User</div>
            <div className="text-[9px] leading-tight" style={{ color: '#999' }}>Ops Manager</div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[8px] font-bold" style={{ color: '#15803d' }}>LIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

