import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, TextInput, ListRenderItemInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { mockATMs, ATMStatus, ATM } from '@atm/shared';

const ORANGE = '#f26522';
const DARK   = '#0f172a';
const MID    = '#64748b';
const MUTED  = '#94a3b8';
const BG     = '#f1f5f9';
const CARD   = '#ffffff';
const BORDER = '#e2e8f0';

const STATUS_COLOR: Record<ATMStatus, string> = {
  online:      '#10b981',
  offline:     '#ef4444',
  warning:     '#f59e0b',
  cash_low:    '#f97316',
  maintenance: '#8b5cf6',
};

const STATUS_LABEL: Record<ATMStatus, string> = {
  online:      'Online',
  offline:     'Offline',
  warning:     'Warning',
  cash_low:    'Cash Low',
  maintenance: 'Maint.',
};

const SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const FILTERS: Array<ATMStatus | 'all'> = ['all', 'online', 'offline', 'warning', 'cash_low', 'maintenance'];

const STATUS_COUNTS = FILTERS.reduce<Record<string, number>>((acc, f) => {
  acc[f] = f === 'all' ? mockATMs.length : mockATMs.filter(a => a.status === f).length;
  return acc;
}, {});

const ATMCard = memo(({ atm }: { atm: ATM }) => {
  const col     = STATUS_COLOR[atm.status];
  const cashCol = atm.cashLevel < 20 ? '#ef4444' : atm.cashLevel < 40 ? '#f97316' : '#10b981';
  const time    = new Date(atm.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const idNum   = atm.id.replace(/\D/g, '').padStart(4, '0');

  return (
    <TouchableOpacity style={[styles.card, SHADOW]} onPress={() => router.push(`/atm/${atm.id}`)}>
      <View style={[styles.accent, { backgroundColor: col }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.atmId}>#{idNum}</Text>
          <View style={[styles.statusChip, { backgroundColor: col + '18', borderColor: col + '50' }]}>
            <View style={[styles.statusDot, { backgroundColor: col }]} />
            <Text style={[styles.statusTxt, { color: col }]}>{STATUS_LABEL[atm.status]}</Text>
          </View>
        </View>
        <Text style={styles.atmName} numberOfLines={1}>{atm.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={MUTED} />
          <Text style={styles.locationTxt} numberOfLines={1}>{atm.address}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.cashWrap}>
            <View style={styles.cashBg}>
              <View style={[styles.cashFill, { width: `${atm.cashLevel}%` as any, backgroundColor: cashCol }]} />
            </View>
            <Text style={[styles.cashPct, { color: cashCol }]}>{atm.cashLevel}%</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaTxt}>{atm.model.split(' ').slice(-1)[0]}</Text>
            <View style={styles.metaDot} />
            <Ionicons name="time-outline" size={10} color={MUTED} />
            <Text style={styles.metaTxt}>{time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function ATMListScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ATMStatus | 'all'>('all');

  const filtered = useMemo(() =>
    mockATMs.filter(atm => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        atm.name.toLowerCase().includes(q) ||
        atm.location.toLowerCase().includes(q) ||
        atm.address.toLowerCase().includes(q);
      return matchSearch && (filter === 'all' || atm.status === filter);
    }),
    [search, filter]
  );

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ATM>) => <ATMCard atm={item} />, []);
  const keyExtractor = useCallback((item: ATM) => item.id, []);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ATM Network</Text>
          <Text style={styles.headerSub}>Bank of Punjab · Pakistan</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeTxt}>{mockATMs.length.toLocaleString()} ATMs</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={MUTED} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ATMs, cities, addresses..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={MUTED} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => {
          const active = filter === f;
          const col    = f === 'all' ? DARK : STATUS_COLOR[f as ATMStatus];
          const count  = STATUS_COUNTS[f];
          return (
            <TouchableOpacity
              key={f}
              style={[styles.chip, active && { backgroundColor: col, borderColor: col }]}
              onPress={() => setFilter(f)}
            >
              {f !== 'all' && <View style={[styles.chipDot, { backgroundColor: active ? '#fff' : col }]} />}
              <Text style={[styles.chipTxt, active && { color: '#fff' }]}>
                {f === 'all' ? 'All' : STATUS_LABEL[f as ATMStatus]}
              </Text>
              <View style={[styles.chipCount, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={[styles.chipCountTxt, active && { color: '#fff' }]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.resultCount}>
        {filtered.length.toLocaleString()} of {mockATMs.length.toLocaleString()} ATMs
      </Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        initialNumToRender={20}
        maxToRenderPerBatch={15}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={32} color={MUTED} />
            <Text style={styles.emptyTxt}>No ATMs found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: DARK },
  headerSub:   { fontSize: 11, color: MUTED, fontWeight: '500', marginTop: 1 },
  countBadge:  { backgroundColor: ORANGE + '18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  countBadgeTxt: { color: ORANGE, fontSize: 12, fontWeight: '800' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', margin: 12,
    backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: DARK, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: DARK },

  filterScroll:  { maxHeight: 50 },
  filterContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  chipDot:      { width: 6, height: 6, borderRadius: 3 },
  chipTxt:      { fontSize: 12, color: MID, fontWeight: '600' },
  chipCount:    { backgroundColor: BG, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  chipCountTxt: { fontSize: 10, color: MID, fontWeight: '700' },

  resultCount: { fontSize: 11, color: MUTED, fontWeight: '600', marginHorizontal: 16, marginTop: 4, marginBottom: 2 },
  list: { padding: 12, paddingTop: 6 },

  // ATM Card
  card: {
    flexDirection: 'row', backgroundColor: CARD, borderRadius: 14, marginBottom: 10,
    overflow: 'hidden', borderWidth: 1, borderColor: BORDER,
  },
  accent: { width: 4, flexShrink: 0 },
  body:   { flex: 1, padding: 12 },

  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  atmId:     { fontSize: 11, fontWeight: '800', color: MUTED, letterSpacing: 0.5 },
  statusChip:{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusTxt: { fontSize: 10, fontWeight: '700' },

  atmName:     { fontSize: 13, fontWeight: '700', color: DARK, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  locationTxt: { fontSize: 11, color: MUTED, flex: 1 },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cashWrap:  { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 12 },
  cashBg:    { flex: 1, height: 5, backgroundColor: BG, borderRadius: 3, overflow: 'hidden' },
  cashFill:  { height: 5, borderRadius: 3 },
  cashPct:   { fontSize: 11, fontWeight: '800', width: 34, textAlign: 'right' },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt:   { fontSize: 10, color: MUTED, fontWeight: '500' },
  metaDot:   { width: 3, height: 3, borderRadius: 2, backgroundColor: BORDER },

  empty:    { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt: { color: MUTED, fontSize: 14, fontWeight: '600' },
});
