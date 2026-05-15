import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockBroadcastNotifications, mockAnnouncementBanners } from '@atm/shared';

const ORANGE = '#f26522';
const DARK   = '#0f172a';
const MID    = '#64748b';
const MUTED  = '#94a3b8';
const BG     = '#f1f5f9';
const CARD   = '#ffffff';
const BORDER = '#e2e8f0';

const SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const BANNER_CFG: Record<string, { color: string; icon: string; bg: string }> = {
  info:        { color: '#3b82f6', icon: 'information-circle', bg: '#eff6ff' },
  warning:     { color: '#f59e0b', icon: 'warning',            bg: '#fffbeb' },
  promo:       { color: ORANGE,    icon: 'gift',                bg: '#fff7f3' },
  maintenance: { color: '#8b5cf6', icon: 'build',              bg: '#f5f3ff' },
};

const NOTIF_STATUS_CFG: Record<string, { color: string; icon: string; label: string }> = {
  sent:      { color: '#10b981', icon: 'checkmark-circle', label: 'Sent'      },
  scheduled: { color: '#3b82f6', icon: 'time',             label: 'Scheduled' },
  draft:     { color: '#94a3b8', icon: 'ellipse-outline',  label: 'Draft'     },
  failed:    { color: '#ef4444', icon: 'close-circle',     label: 'Failed'    },
};

const CHANNEL_LABEL: Record<string, string> = {
  push:   'Push',
  in_app: 'In-App',
  both:   'Push + In-App',
};

function relTime(iso: string | undefined) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TABS = ['broadcasts', 'banners'] as const;
type Tab = typeof TABS[number];

export default function NotificationsScreen() {
  const [tab, setTab] = useState<Tab>('broadcasts');

  const byStatus = useMemo(() => ({
    sent:      mockBroadcastNotifications.filter(n => n.status === 'sent'),
    scheduled: mockBroadcastNotifications.filter(n => n.status === 'scheduled'),
    draft:     mockBroadcastNotifications.filter(n => n.status === 'draft'),
  }), []);

  const activeBanners   = useMemo(() => mockAnnouncementBanners.filter(b => b.isActive), []);
  const inactiveBanners = useMemo(() => mockAnnouncementBanners.filter(b => !b.isActive), []);

  return (
    <View style={s.root}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Notifications</Text>
          <Text style={s.headerSub}>Broadcasts & Announcements</Text>
        </View>
        <View style={s.sentBadge}>
          <Text style={s.sentBadgeTxt}>
            {mockBroadcastNotifications.filter(n => n.status === 'sent').length} sent
          </Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Ionicons
              name={(t === 'broadcasts'
                ? (tab === t ? 'megaphone' : 'megaphone-outline')
                : (tab === t ? 'pricetags' : 'pricetags-outline')) as any}
              size={14}
              color={tab === t ? ORANGE : MUTED}
            />
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
              {t === 'broadcasts' ? 'Broadcasts' : 'Announcements'}
            </Text>
            <View style={[s.tabCount, tab === t && s.tabCountActive]}>
              <Text style={[s.tabCountTxt, tab === t && { color: '#fff' }]}>
                {t === 'broadcasts' ? mockBroadcastNotifications.length : mockAnnouncementBanners.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Broadcasts ── */}
        {tab === 'broadcasts' && (
          <>
            {(['sent', 'scheduled', 'draft'] as const).map(status => {
              const group = byStatus[status];
              if (!group.length) return null;
              const cfg = NOTIF_STATUS_CFG[status];
              return (
                <View key={status}>
                  <View style={s.groupHeader}>
                    <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
                    <Text style={[s.groupLabel, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
                  </View>
                  {group.map(n => (
                    <View key={n.id} style={[s.card, SHADOW]}>
                      <View style={[s.cardAccent, { backgroundColor: cfg.color }]} />
                      <View style={s.cardBody}>
                        <View style={s.cardTopRow}>
                          <View style={[s.cardIcon, { backgroundColor: cfg.color + '18' }]}>
                            <Ionicons name="megaphone-outline" size={14} color={cfg.color} />
                          </View>
                          <View style={s.cardMeta}>
                            <Text style={s.cardTitle} numberOfLines={1}>{n.title}</Text>
                            <Text style={s.cardTime}>
                              {n.status === 'scheduled'
                                ? `Scheduled · ${relTime(n.scheduledFor)}`
                                : n.status === 'sent'
                                ? `Sent ${relTime(n.sentAt)}`
                                : 'Draft · not published'}
                            </Text>
                          </View>
                        </View>
                        <Text style={s.cardMessage} numberOfLines={3}>{n.body}</Text>
                        <View style={s.cardFooterRow}>
                          <View style={s.pill}>
                            <Ionicons name="people-outline" size={10} color={MUTED} />
                            <Text style={s.pillTxt}>{n.audienceLabel}</Text>
                          </View>
                          <View style={s.pill}>
                            <Ionicons name="send-outline" size={10} color={MUTED} />
                            <Text style={s.pillTxt}>{CHANNEL_LABEL[n.channel]}</Text>
                          </View>
                          {n.sentCount !== undefined && (
                            <View style={s.pill}>
                              <Ionicons name="checkmark-done-outline" size={10} color={MUTED} />
                              <Text style={s.pillTxt}>{n.sentCount.toLocaleString()} reached</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* ── Banners ── */}
        {tab === 'banners' && (
          <>
            {activeBanners.length > 0 && (
              <View>
                <View style={s.groupHeader}>
                  <View style={[s.groupDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[s.groupLabel, { color: '#10b981' }]}>ACTIVE</Text>
                </View>
                {activeBanners.map(b => {
                  const cfg = BANNER_CFG[b.type] || BANNER_CFG.info;
                  const endsInH = Math.round((new Date(b.endsAt).getTime() - Date.now()) / 3600000);
                  return (
                    <View key={b.id} style={[s.bannerCard, SHADOW, { borderColor: cfg.color + '30' }]}>
                      <View style={[s.bannerTop, { backgroundColor: cfg.bg }]}>
                        <View style={[s.bannerIconWrap, { backgroundColor: cfg.color + '20' }]}>
                          <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                        </View>
                        <View style={s.bannerMeta}>
                          <Text style={[s.bannerTitle, { color: cfg.color }]}>{b.title}</Text>
                          <View style={s.bannerTypePill}>
                            <Text style={[s.bannerTypeTxt, { color: cfg.color }]}>{b.type.toUpperCase()}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={s.bannerBody}>
                        <Text style={s.bannerMsg}>{b.message}</Text>
                        <View style={s.bannerFooter}>
                          <View style={s.pill}>
                            <Ionicons name="phone-portrait-outline" size={10} color={MUTED} />
                            <Text style={s.pillTxt}>{b.targetScreen.replace('_', ' ')}</Text>
                          </View>
                          <View style={s.pill}>
                            <Ionicons name="time-outline" size={10} color={MUTED} />
                            <Text style={s.pillTxt}>{endsInH > 0 ? `Ends in ${endsInH}h` : 'Ending soon'}</Text>
                          </View>
                          {b.ctaLabel && (
                            <View style={[s.ctaPill, { backgroundColor: cfg.color }]}>
                              <Text style={s.ctaTxt}>{b.ctaLabel}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            {inactiveBanners.length > 0 && (
              <View>
                <View style={s.groupHeader}>
                  <View style={[s.groupDot, { backgroundColor: MUTED }]} />
                  <Text style={[s.groupLabel, { color: MUTED }]}>INACTIVE</Text>
                </View>
                {inactiveBanners.map(b => {
                  const cfg = BANNER_CFG[b.type] || BANNER_CFG.info;
                  return (
                    <View key={b.id} style={[s.bannerCard, SHADOW, { opacity: 0.6 }]}>
                      <View style={[s.bannerTop, { backgroundColor: BG }]}>
                        <View style={[s.bannerIconWrap, { backgroundColor: MUTED + '20' }]}>
                          <Ionicons name={cfg.icon as any} size={18} color={MUTED} />
                        </View>
                        <View style={s.bannerMeta}>
                          <Text style={[s.bannerTitle, { color: MID }]}>{b.title}</Text>
                          <View style={s.bannerTypePill}>
                            <Text style={[s.bannerTypeTxt, { color: MUTED }]}>{b.type.toUpperCase()}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={s.bannerBody}>
                        <Text style={[s.bannerMsg, { color: MUTED }]}>{b.message}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: DARK },
  headerSub:   { fontSize: 11, color: MUTED, fontWeight: '500', marginTop: 1 },
  sentBadge:   { backgroundColor: ORANGE + '18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  sentBadgeTxt:{ color: ORANGE, fontSize: 12, fontWeight: '800' },

  tabBar:         { flexDirection: 'row', backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER, paddingHorizontal: 16 },
  tab:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, marginRight: 20, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:      { borderBottomColor: ORANGE },
  tabTxt:         { fontSize: 13, fontWeight: '600', color: MUTED },
  tabTxtActive:   { color: ORANGE, fontWeight: '800' },
  tabCount:       { backgroundColor: BG, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  tabCountActive: { backgroundColor: ORANGE },
  tabCountTxt:    { fontSize: 10, fontWeight: '800', color: '#64748b' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 4 },
  groupDot:    { width: 7, height: 7, borderRadius: 4 },
  groupLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  card:        { flexDirection: 'row', backgroundColor: CARD, borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  cardAccent:  { width: 3, flexShrink: 0 },
  cardBody:    { flex: 1, padding: 12 },
  cardTopRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardIcon:    { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardMeta:    { flex: 1 },
  cardTitle:   { fontSize: 13, fontWeight: '700', color: DARK },
  cardTime:    { fontSize: 10, color: MUTED, marginTop: 1 },
  cardMessage: { fontSize: 12, color: MID, lineHeight: 18, marginBottom: 10 },
  cardFooterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  pill:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: BG, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  pillTxt: { fontSize: 10, color: MID, fontWeight: '600' },
  ctaPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  ctaTxt:  { fontSize: 10, fontWeight: '800', color: '#fff' },

  bannerCard:    { backgroundColor: CARD, borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1 },
  bannerTop:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  bannerIconWrap:{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bannerMeta:    { flex: 1 },
  bannerTitle:   { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  bannerTypePill:{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  bannerTypeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  bannerBody:    { paddingHorizontal: 14, paddingBottom: 14 },
  bannerMsg:     { fontSize: 12, color: MID, lineHeight: 18, marginBottom: 10 },
  bannerFooter:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
