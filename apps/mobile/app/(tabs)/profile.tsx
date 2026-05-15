import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ORANGE = '#f26522';
const DARK   = '#0f172a';
const MID    = '#64748b';
const MUTED  = '#94a3b8';
const BG     = '#f1f5f9';
const CARD   = '#ffffff';
const BORDER = '#e2e8f0';

const SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

type RowItem = { label: string; value: string; icon: string };

const ACCOUNT_ROWS: RowItem[] = [
  { label: 'Username',   value: 'admin',                   icon: 'person-outline'           },
  { label: 'Email',      value: 'admin@bankofpunjab.com',  icon: 'mail-outline'             },
  { label: 'Department', value: 'Operations & Control',    icon: 'business-outline'         },
  { label: 'Role',       value: 'Full Administrator',      icon: 'shield-checkmark-outline' },
];

const SYSTEM_ROWS: RowItem[] = [
  { label: 'App Version',    value: '2.1.0',           icon: 'code-slash-outline'    },
  { label: 'Environment',    value: 'Production',      icon: 'server-outline'        },
  { label: 'ATMs Monitored', value: '1,000',           icon: 'hardware-chip-outline' },
  { label: 'Last Sync',      value: new Date().toLocaleTimeString(), icon: 'sync-outline' },
];

function Section({ title, rows }: { title: string; rows: RowItem[] }) {
  return (
    <View style={[s.section, SHADOW]}>
      <Text style={s.sectionTitle}>{title}</Text>
      {rows.map((row, i) => (
        <View key={row.label} style={[s.row, i < rows.length - 1 && s.rowBorder]}>
          <View style={s.rowIcon}>
            <Ionicons name={row.icon as any} size={15} color={ORANGE} />
          </View>
          <Text style={s.rowLabel}>{row.label}</Text>
          <Text style={s.rowValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
        <Text style={s.headerSub}>Account & Settings</Text>
      </View>

      {/* Avatar card */}
      <View style={[s.avatarCard, SHADOW]}>
        <View style={s.avatarBg1} />
        <View style={s.avatarBg2} />
        <View style={s.avatarRing}>
          <View style={s.avatar}>
            <Text style={s.avatarInitials}>AU</Text>
          </View>
        </View>
        <Text style={s.avatarName}>Admin User</Text>
        <Text style={s.avatarRole}>ATM Operations Manager</Text>
        <View style={s.avatarChips}>
          <View style={s.chip}>
            <View style={[s.chipDot, { backgroundColor: '#10b981' }]} />
            <Text style={s.chipTxt}>Online</Text>
          </View>
          <View style={s.chip}>
            <Ionicons name="shield-checkmark" size={11} color={ORANGE} />
            <Text style={s.chipTxt}>Full Access</Text>
          </View>
        </View>
      </View>

      <Section title="Account" rows={ACCOUNT_ROWS} />
      <Section title="System"  rows={SYSTEM_ROWS} />

      <TouchableOpacity style={s.signOutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={s.signOutTxt}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.footer}>Bank of Punjab ATM Monitoring  ·  v2.1.0</Text>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 40 },

  header: {
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: DARK },
  headerSub:   { fontSize: 11, color: MUTED, fontWeight: '500', marginTop: 1 },

  // Avatar card
  avatarCard: {
    margin: 16, borderRadius: 20, backgroundColor: CARD, alignItems: 'center',
    paddingVertical: 32, paddingHorizontal: 20,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
  },
  avatarBg1: {
    position: 'absolute', top: -30, right: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: ORANGE + '10',
  },
  avatarBg2: {
    position: 'absolute', bottom: -20, left: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: ORANGE + '08',
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: ORANGE + '40',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { fontSize: 28, fontWeight: '900', color: '#fff' },
  avatarName:     { fontSize: 18, fontWeight: '800', color: DARK, marginBottom: 3 },
  avatarRole:     { fontSize: 12, color: MID, fontWeight: '500', marginBottom: 14 },
  avatarChips:    { flexDirection: 'row', gap: 8 },
  chip:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: BG, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: BORDER },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipTxt: { fontSize: 11, color: MID, fontWeight: '600' },

  // Section
  section:      { marginHorizontal: 16, marginBottom: 14, backgroundColor: CARD, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: MUTED, letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase' },
  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: BG },
  rowIcon:      { width: 28, height: 28, borderRadius: 8, backgroundColor: ORANGE + '12', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel:     { flex: 1, fontSize: 13, color: MID, fontWeight: '500' },
  rowValue:     { fontSize: 13, fontWeight: '700', color: DARK },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 4, marginBottom: 16,
    backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#fecaca',
  },
  signOutTxt: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  footer: { textAlign: 'center', fontSize: 10, color: MUTED, fontWeight: '500', marginBottom: 8 },
});
