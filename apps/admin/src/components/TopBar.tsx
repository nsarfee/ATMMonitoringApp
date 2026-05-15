'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { mockATMs } from '@atm/shared';
import { logoutAction } from '@/app/login/actions';

const BOP_ORANGE  = '#f26522';
const BOP_DARK    = '#ffffff';
const BOP_BORDER  = '#e5e5ea';
const BOP_PANEL   = '#f5f5f7';

const offlineCount = mockATMs.filter(a => a.status === 'offline').length;
const onlineCount  = mockATMs.filter(a => a.status === 'online').length;
const OPEN_INCIDENTS = 3;

const titles: Record<string, { label: string; sub: string }> = {
  '/':        { label: 'OPERATIONS CENTER',    sub: 'Real-time ATM Fleet Monitor' },
  '/atms':    { label: 'ATM FLEET MONITOR',    sub: 'Device status, cash levels and health' },
  '/tickets': { label: 'INCIDENT MANAGEMENT',  sub: 'Active incidents, SLA tracking' },
  '/users':   { label: 'USER ACCESS CONTROL',  sub: 'Operators and role management' },
  '/vendors': { label: 'VENDOR SLA TRACKER',   sub: 'Vendor performance and assignments' },
};

export default function TopBar() {
  const pathname = usePathname();
  const page = titles[pathname] ?? { label: 'ATM CONTROL', sub: '' };
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="h-12 px-5 flex items-center justify-between shrink-0"
      style={{ background: BOP_DARK, borderBottom: `1px solid ${BOP_BORDER}` }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2">
        <span
          className="w-0.5 h-4 rounded-full shrink-0"
          style={{ background: BOP_ORANGE }}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold" style={{ color: '#aaa' }}>BOP</span>
          <span style={{ color: '#ccc' }}>/</span>
          <span className="text-[11px] font-black tracking-widest" style={{ color: '#555' }}>
            {page.label}
          </span>
        </div>
      </div>

      {/* Centre: live fleet gauges */}
      <div className="hidden md:flex items-center gap-6">
        {[
          { label: 'ONLINE',    value: onlineCount,    color: '#15803d' },
          { label: 'OFFLINE',   value: offlineCount,   color: offlineCount > 0 ? BOP_ORANGE : '#ccc' },
          { label: 'INCIDENTS', value: OPEN_INCIDENTS, color: OPEN_INCIDENTS > 0 ? '#d97706' : '#ccc' },
        ].map(g => (
          <div key={g.label} className="flex items-center gap-1.5">
            <span className="text-[8px] font-black tracking-widest" style={{ color: '#ccc' }}>{g.label}</span>
            <span className="text-sm font-black" style={{ color: g.color, fontFamily: 'monospace' }}>{g.value}</span>
          </div>
        ))}
      </div>

      {/* Right: clock + LIVE */}
      <div className="flex items-center gap-3">
        {/* LIVE badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black"
          style={{ background: '#fff4ee', border: `1px solid ${BOP_ORANGE}50`, color: BOP_ORANGE }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BOP_ORANGE }} />
          LIVE
        </div>

        {/* Clock */}
        <div className="text-right hidden sm:block">
          <div
            className="text-[13px] font-black leading-tight"
            style={{ color: '#1d1d1f', fontFamily: 'monospace', letterSpacing: '0.05em' }}
          >
            {time
              ? time.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
              : '--:--:--'}
          </div>
          <div className="text-[8px] leading-tight" style={{ color: '#aaa' }}>
            {time
              ? time.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
              : ''}
          </div>
        </div>

        {/* Notification */}
        <div
          className="relative w-7 h-7 rounded flex items-center justify-center cursor-pointer"
          style={{ background: BOP_PANEL, border: `1px solid ${BOP_BORDER}` }}
        >
          <span className="text-[13px]" style={{ color: '#555' }}>🔔</span>
          <span
            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
            style={{ background: BOP_ORANGE, border: `1px solid ${BOP_DARK}` }}
          />
        </div>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-colors"
            style={{ background: BOP_PANEL, border: `1px solid ${BOP_BORDER}`, color: '#888' }}
            title="Sign out"
          >
            <span className="text-[11px]">⎋</span>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}

