import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { mockATMs, mockAlerts } from '@atm/shared';

const ORANGE  = '#f26522';
const DARK    = '#0f172a';
const MID     = '#64748b';
const MUTED   = '#94a3b8';
const BG      = '#f1f5f9';
const CARD    = '#ffffff';
const BORDER  = '#e2e8f0';
const SUCCESS = '#10b981';
const DANGER  = '#ef4444';
const WARNING = '#f59e0b';
const PURPLE  = '#8b5cf6';

const SHADOW = {
  shadowColor: DARK,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 3,
};

const STATUS_SEGS = [
  { key: 'online',      label: 'Online',   color: SUCCESS },
  { key: 'warning',     label: 'Warning',  color: WARNING },
  { key: 'cash_low',    label: 'Cash Low', color: ORANGE  },
  { key: 'maintenance', label: 'Maint.',   color: PURPLE  },
  { key: 'offline',     label: 'Offline',  color: DANGER  },
];

const TICKS = [
  { level: 'critical', msg: 'ATM-042 Gulberg Branch — Cash critically low (8%)' },
  { level: 'warning',  msg: 'ATM-017 DHA Phase 5 — Network intermittent since 09:14' },
  { level: 'ok',       msg: 'ATM-009 Liberty Market — Back online after maintenance' },
  { level: 'info',     msg: 'ATM-031 Johar Town — Technician dispatched, ETA 35 min' },
  { level: 'info',     msg: 'Fleet uptime today: 94.2%  ·  12 active incidents' },
  { level: 'critical', msg: 'ATM-056 Bahria Town — Card reader fault detected' },
];

const LEVEL_COLOR: Record<string, string> = {
  critical: DANGER, warning: WARNING, ok: SUCCESS, info: ORANGE,
};

const LEVEL_LABEL: Record<string, string> = {
  critical: 'CRITICAL', warning: 'WARNING', ok: 'RESOLVED', info: 'INFO',
};

// ─── Live Ticker ─────────────────────────────────────────────────────────────
function Ticker() {
  const anim   = useRef(new Animated.Value(0)).current;
  const idxRef = useRef(0);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let dead = false;
    const go = () => {
      if (dead) return;
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 9000, useNativeDriver: false })
        .start(({ finished }) => {
          if (finished && !dead) {
            idxRef.current = (idxRef.current + 1) % TICKS.length;
            setIdx(idxRef.current);
            setTimeout(go, 200);
          }
        });
    };
    const t = setTimeout(go, 400);
    return () => { dead = true; clearTimeout(t); anim.stopAnimation(); };
  }, []);

  const { level, msg } = TICKS[idx];
  const col = LEVEL_COLOR[level];
  const lbl = LEVEL_LABEL[level];
  const tx  = anim.interpolate({ inputRange: [0, 1], outputRange: [380, -1100] });

  return (
    <View style={s.ticker}>
      <View style={[s.tickPip, { backgroundColor: col }]} />
      <View style={s.tickTrack}>
        <Animated.View style={{ transform: [{ translateX: tx }], flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[s.tickLbl, { color: col }]}>{lbl}{'  '}</Text>
          <Text style={s.tickMsg}>{msg}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: string;
}) {
  return (
    <View style={[s.statCard, SHADOW]}>
      <View style={[s.statIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[s.statVal, { color }]}>{value.toLocaleString()}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Fleet Distribution Bar ───────────────────────────────────────────────────
function FleetBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  return (
    <View style={[s.card, SHADOW]}>
      <View style={s.cardRow}>
        <Text style={s.cardTitle}>Fleet Distribution</Text>
        <Text style={s.cardSub}>{total} ATMs</Text>
      </View>
      <View style={s.fleetBar}>
        {STATUS_SEGS.map(seg => {
          const n = counts[seg.key] || 0;
          if (!n) return null;
          return <View key={seg.key} style={[s.fleetSeg, { flex: n, backgroundColor: seg.color }]} />;
        })}
      </View>
      <View style={s.legend}>
        {STATUS_SEGS.map(seg => {
          const n = counts[seg.key] || 0;
          if (!n) return null;
          const pct = Math.round((n / total) * 100);
          return (
            <View key={seg.key} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: seg.color }]} />
              <Text style={s.legendText}>
                {seg.label}{'  '}
                <Text style={{ fontWeight: '700', color: DARK }}>{n}</Text>
                {'  '}
                <Text style={{ color: MUTED }}>({pct}%)</Text>
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Cash Level Chart ─────────────────────────────────────────────────────────
function CashChart() {
  const bottom8 = [...mockATMs].sort((a, b) => a.cashLevel - b.cashLevel).slice(0, 8);
  return (
    <View style={[s.card, SHADOW]}>
      <View style={s.cardRow}>
        <Text style={s.cardTitle}>Lowest Cash Levels</Text>
        <View style={s.critBadge}>
          <Text style={s.critBadgeTxt}>{bottom8.filter(a => a.cashLevel < 25).length} critical</Text>
        </View>
      </View>
      {bottom8.map(atm => {
        const col  = atm.cashLevel < 20 ? DANGER : atm.cashLevel < 40 ? ORANGE : SUCCESS;
        const name = atm.name.replace(/ATM\s*[-–]\s*/i, '').split(' ').slice(0, 3).join(' ');
        return (
          <View key={atm.id} style={s.cashRow}>
            <Text style={s.cashName} numberOfLines={1}>{name}</Text>
            <View style={s.cashBarBg}>
              <View style={[s.cashBarFill, { width: `${atm.cashLevel}%` as any, backgroundColor: col }]} />
            </View>
            <Text style={[s.cashPct, { color: col }]}>{atm.cashLevel}%</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Incident Feed ────────────────────────────────────────────────────────────
function IncidentFeed({ alerts }: { alerts: any[] }) {
  return (
    <View style={[s.card, SHADOW]}>
      <View style={s.cardRow}>
        <Text style={s.cardTitle}>Recent Incidents</Text>
        <View style={s.livePill}>
          <View style={[s.livePip, { backgroundColor: DANGER }]} />
          <Text style={s.livePillTxt}>LIVE</Text>
        </View>
      </View>
      {alerts.map((a, i) => {
        const col  = a.severity === 'critical' ? DANGER : a.severity === 'high' ? ORANGE : WARNING;
        const time = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
          <View key={a.id} style={[s.incident, i < alerts.length - 1 && s.incidentBorder]}>
            <View style={[s.incidentBar, { backgroundColor: col }]} />
            <View style={s.incidentBody}>
              <View style={s.incidentTop}>
                <View style={[s.sevBadge, { backgroundColor: col + '18', borderColor: col + '40' }]}>
                  <Text style={[s.sevTxt, { color: col }]}>{a.severity.toUpperCase()}</Text>
                </View>
                <Text style={s.incidentTime}>{time}</Text>
              </View>
              <Text style={s.incidentAtm}>{a.atmName}</Text>
              <Text style={s.incidentMsg} numberOfLines={1}>{a.message}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Action Grid ──────────────────────────────────────────────────────────────
const ACTIONS = [
  { label: 'ATM Network', icon: 'hardware-chip', color: ORANGE,    route: '/atms'    },
  { label: 'Alerts',      icon: 'notifications', color: DANGER,    route: '/alerts'  },
  { label: 'Reports',     icon: 'bar-chart',     color: '#3b82f6', route: null       },
  { label: 'Profile',     icon: 'person-circle', color: PURPLE,    route: '/profile' },
] as const;

function ActionGrid() {
  return (
    <View style={s.actionGrid}>
      {ACTIONS.map(a => (
        <TouchableOpacity
          key={a.label}
          style={[s.actionTile, SHADOW]}
          onPress={() => a.route && router.push(a.route as any)}
        >
          <View style={[s.actionIconWrap, { backgroundColor: a.color + '15' }]}>
            <Ionicons name={a.icon as any} size={22} color={a.color} />
          </View>
          <Text style={s.actionLabel}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const total        = mockATMs.length;
  const online       = mockATMs.filter(a => a.status === 'online').length;
  const offline      = mockATMs.filter(a => a.status === 'offline').length;
  const maintenance  = mockATMs.filter(a => a.status === 'maintenance').length;
  const cashLow      = mockATMs.filter(a => a.status === 'cash_low').length;
  const activeAlerts = mockAlerts.filter(a => !a.resolved).length;
  const uptimePct    = Math.round((online / total) * 100);

  const counts: Record<string, number> = {};
  mockATMs.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const critAlerts = mockAlerts
    .filter(a => !a.resolved)
    .sort((a, b) => a.severity === 'critical' ? -1 : 1)
    .slice(0, 4);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero Card ── */}
      <View style={s.hero}>
        <View style={s.heroBubble1} />
        <View style={s.heroBubble2} />
        <View style={s.heroHead}>
          <Text style={s.heroBankLabel}>THE BANK OF PUNJAB</Text>
          <View style={s.heroBOPBadge}><Text style={s.heroBOPText}>BOP</Text></View>
        </View>
        <View style={s.heroBody}>
          <View>
            <Text style={s.heroNum}>{uptimePct}%</Text>
            <Text style={s.heroNumSub}>Fleet Uptime</Text>
          </View>
          <View style={s.heroVDivider} />
          <View>
            <Text style={s.heroNum}>{online.toLocaleString()}</Text>
            <Text style={s.heroNumSub}>ATMs Online</Text>
          </View>
        </View>
        <View style={s.heroSepLine} />
        <View style={s.heroStatRow}>
          <View style={s.heroStatItem}>
            <View style={[s.heroStatDot, { backgroundColor: SUCCESS }]} />
            <Text style={s.heroStatTxt}>Online {online}</Text>
          </View>
          <View style={s.heroStatItem}>
            <View style={[s.heroStatDot, { backgroundColor: DANGER }]} />
            <Text style={s.heroStatTxt}>Offline {offline}</Text>
          </View>
          <View style={s.heroStatItem}>
            <View style={[s.heroStatDot, { backgroundColor: ORANGE }]} />
            <Text style={s.heroStatTxt}>Cash Low {cashLow}</Text>
          </View>
        </View>
      </View>

      {/* ── Live Ticker ── */}
      <Ticker />

      {/* ── Stat Grid ── */}
      <View style={s.statGrid}>
        <StatCard label="Total ATMs"    value={total}        color={ORANGE} icon="hardware-chip" />
        <StatCard label="Active Alerts" value={activeAlerts} color={DANGER} icon="notifications" />
        <StatCard label="Offline"       value={offline}      color={MID}    icon="close-circle"  />
        <StatCard label="Maintenance"   value={maintenance}  color={PURPLE} icon="build"         />
      </View>

      {/* ── Fleet Distribution ── */}
      <FleetBar counts={counts} total={total} />

      {/* ── Cash Levels ── */}
      <CashChart />

      {/* ── Recent Incidents ── */}
      <IncidentFeed alerts={critAlerts} />

      {/* ── Quick Access ── */}
      <Text style={s.sectionLabel}>QUICK ACCESS</Text>
      <ActionGrid />

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  content: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 32 },

  // ── Hero ──
  hero: {
    backgroundColor: ORANGE, borderRadius: 20, marginBottom: 12,
    overflow: 'hidden', padding: 20,
  },
  heroBubble1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)', right: -40, top: -40,
  },
  heroBubble2: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.07)', right: 60, bottom: -20,
  },
  heroHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  heroBankLabel: {
    color: 'rgba(255,255,255,0.75)', fontSize: 10,
    fontWeight: '700', letterSpacing: 2,
  },
  heroBOPBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heroBOPText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  heroBody:    { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroNum:     { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 48 },
  heroNumSub:  { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
  heroVDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 24 },
  heroSepLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 14 },
  heroStatRow: { flexDirection: 'row', gap: 16 },
  heroStatItem:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroStatDot: { width: 7, height: 7, borderRadius: 4 },
  heroStatTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },

  // ── Ticker ──
  ticker: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: DARK,
    borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14,
    marginBottom: 14, overflow: 'hidden',
  },
  tickPip:   { width: 8, height: 8, borderRadius: 4, marginRight: 12, flexShrink: 0 },
  tickTrack: { flex: 1, overflow: 'hidden' },
  tickLbl:   { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  tickMsg:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // ── Stat grid ──
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: {
    width: '47.5%', backgroundColor: CARD, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: BORDER,
  },
  statIcon:  { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statVal:   { fontSize: 26, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 11, color: MID, fontWeight: '600' },

  // ── Card base ──
  card: {
    backgroundColor: CARD, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: BORDER,
  },
  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: DARK },
  cardSub:   { fontSize: 11, color: MUTED, fontWeight: '600' },

  // Fleet bar
  fleetBar: { height: 20, flexDirection: 'row', borderRadius: 10, overflow: 'hidden', marginBottom: 14, gap: 2 },
  fleetSeg: { height: '100%' },
  legend:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: MID },

  // Critical badge
  critBadge:   { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  critBadgeTxt:{ color: DANGER, fontSize: 10, fontWeight: '700' },

  // Cash chart
  cashRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cashName:   { width: 96, fontSize: 10, color: MID, fontWeight: '600' },
  cashBarBg:  { flex: 1, height: 8, backgroundColor: BG, borderRadius: 4, overflow: 'hidden' },
  cashBarFill:{ height: 8, borderRadius: 4 },
  cashPct:    { width: 38, textAlign: 'right', fontSize: 11, fontWeight: '800' },

  // Live pill
  livePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  livePip:    { width: 7, height: 7, borderRadius: 4 },
  livePillTxt:{ color: DANGER, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

  // Incident feed
  incident:      { flexDirection: 'row', paddingVertical: 10 },
  incidentBorder:{ borderBottomWidth: 1, borderBottomColor: BG },
  incidentBar:   { width: 3, borderRadius: 2, marginRight: 10, alignSelf: 'stretch' },
  incidentBody:  { flex: 1 },
  incidentTop:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sevBadge:      { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  sevTxt:        { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  incidentTime:  { fontSize: 10, color: MUTED },
  incidentAtm:   { fontSize: 12, fontWeight: '700', color: DARK, marginBottom: 2 },
  incidentMsg:   { fontSize: 11, color: MID },

  // Section label
  sectionLabel: { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 1.5, marginBottom: 10 },

  // Action grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  actionTile: {
    width: '47.5%', backgroundColor: CARD, borderRadius: 14,
    padding: 16, alignItems: 'flex-start',
    borderWidth: 1, borderColor: BORDER,
  },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel:    { fontSize: 13, fontWeight: '700', color: DARK },
});

