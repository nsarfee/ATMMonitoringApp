import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { mockATMs, ATM } from '@atm/shared';

const statusColor: Record<string, string> = {
  online: '#10b981',
  offline: '#ef4444',
  warning: '#f59e0b',
  cash_low: '#f97316',
  maintenance: '#6366f1',
};

const deviceStatus = (s: string) => ({ ok: '✅', error: '❌', warning: '⚠️' }[s] ?? '?');

type Tab = 'status' | 'cash' | 'devices' | 'events';

export default function ATMDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const atm: ATM | undefined = mockATMs.find((a) => a.id === id);
  const [activeTab, setActiveTab] = useState<Tab>('status');

  if (!atm) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>ATM not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.header}>
        <Text style={styles.atmName}>{atm.name}</Text>
        <Text style={styles.atmAddress}>📍 {atm.address}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor[atm.status] }]}>
          <Text style={styles.statusText}>{atm.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['status', 'cash', 'devices', 'events'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16 }}>
        {activeTab === 'status' && (
          <View>
            <InfoRow label="Model" value={atm.model} />
            <InfoRow label="Serial Number" value={atm.serialNumber} />
            <InfoRow label="Location" value={atm.location} />
            <InfoRow label="Last Seen" value={new Date(atm.lastSeen).toLocaleString()} />
            <InfoRow label="Status" value={atm.status.replace('_', ' ')} />
            <InfoRow label="Coordinates" value={`${atm.coordinates.lat}, ${atm.coordinates.lng}`} />
          </View>
        )}

        {activeTab === 'cash' && (
          <View>
            <View style={styles.cashCircle}>
              <Text style={styles.cashPercent}>{atm.cashLevel}%</Text>
              <Text style={styles.cashLabel}>Cash Level</Text>
            </View>
            <View style={styles.cashBar}>
              <View style={[styles.cashFill, { width: `${atm.cashLevel}%` as any, backgroundColor: atm.cashLevel < 20 ? '#ef4444' : atm.cashLevel < 40 ? '#f59e0b' : '#10b981' }]} />
            </View>
            <Text style={styles.cashHint}>
              {atm.cashLevel < 20 ? '🔴 Critical: Immediate replenishment required' : atm.cashLevel < 40 ? '🟡 Low: Schedule replenishment soon' : '🟢 Adequate cash level'}
            </Text>
          </View>
        )}

        {activeTab === 'devices' && (
          <View>
            {Object.entries(atm.devices).map(([device, status]) => (
              <View key={device} style={styles.deviceRow}>
                <Text style={styles.deviceName}>{device.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</Text>
                <Text style={styles.deviceStatus}>{deviceStatus(status)} {status.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'events' && (
          <View>
            {atm.events.length === 0 && <Text style={styles.empty}>No events recorded</Text>}
            {atm.events.map((event) => (
              <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.type === 'error' ? '#ef4444' : event.type === 'warning' ? '#f59e0b' : '#10b981' }]}>
                <Text style={styles.eventMsg}>{event.message}</Text>
                <Text style={styles.eventTime}>{new Date(event.timestamp).toLocaleString()}</Text>
                <View style={[styles.eventBadge, { backgroundColor: event.type === 'error' ? '#fef2f2' : event.type === 'warning' ? '#fffbeb' : '#f0fdf4' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: event.type === 'error' ? '#ef4444' : event.type === 'warning' ? '#f59e0b' : '#10b981' }}>
                    {event.type.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: '#aaa' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  atmName: { fontSize: 17, fontWeight: '800', color: '#1d1d1f', marginBottom: 4 },
  atmAddress: { fontSize: 13, color: '#888', marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#f26522' },
  tabText: { fontSize: 13, color: '#aaa' },
  tabTextActive: { color: '#f26522', fontWeight: '700' },
  body: { flex: 1 },
  infoRow: { backgroundColor: '#fff', padding: 14, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f5f5f7' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1d1d1f' },
  cashCircle: { alignItems: 'center', marginVertical: 24 },
  cashPercent: { fontSize: 52, fontWeight: '800', color: '#f26522' },
  cashLabel: { fontSize: 13, color: '#aaa' },
  cashBar: { height: 12, backgroundColor: '#e5e5ea', borderRadius: 6, overflow: 'hidden', marginHorizontal: 16, marginBottom: 12 },
  cashFill: { height: '100%', borderRadius: 6 },
  cashHint: { textAlign: 'center', fontSize: 13, color: '#666', paddingHorizontal: 16 },
  deviceRow: { backgroundColor: '#fff', padding: 16, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f5f5f7' },
  deviceName: { fontSize: 14, color: '#555' },
  deviceStatus: { fontSize: 13, fontWeight: '600' },
  eventCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderWidth: 1, borderColor: '#e5e5ea' },
  eventMsg: { fontSize: 13, color: '#1d1d1f', fontWeight: '700', marginBottom: 4 },
  eventTime: { fontSize: 11, color: '#aaa', marginBottom: 6 },
  eventBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 32, fontSize: 14 },
});
