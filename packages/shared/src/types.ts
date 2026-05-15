export type ATMStatus = 'online' | 'offline' | 'warning' | 'cash_low' | 'maintenance';

export interface ATM {
  id: string;
  name: string;
  location: string;
  address: string;
  status: ATMStatus;
  cashLevel: number; // percentage 0-100
  lastSeen: string; // ISO date string
  model: string;
  serialNumber: string;
  devices: {
    cardReader: 'ok' | 'error' | 'warning';
    printer: 'ok' | 'error' | 'warning';
    display: 'ok' | 'error' | 'warning';
    pinpad: 'ok' | 'error' | 'warning';
    cashDispenser: 'ok' | 'error' | 'warning';
  };
  events: ATMEvent[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ATMEvent {
  id: string;
  atmId: string;
  type: 'error' | 'warning' | 'info' | 'maintenance';
  message: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  atmId: string;
  atmName: string;
  type: 'atm_down' | 'atm_up' | 'cash_low' | 'device_error' | 'maintenance';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
}

export interface Ticket {
  id: string;
  atmId: string;
  atmName: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'app_users' | 'branch_users' | 'custom';
  audienceLabel: string;
  channel: 'push' | 'in_app' | 'both';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentAt?: string;
  scheduledFor?: string;
  createdAt: string;
  sentCount?: number;
  createdBy: string;
}

export interface AnnouncementBanner {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promo' | 'maintenance';
  isActive: boolean;
  priority: number; // 1 = highest
  startsAt: string;
  endsAt: string;
  targetScreen: 'home' | 'atm_finder' | 'all_screens';
  ctaLabel?: string;
  ctaUrl?: string;
  createdAt: string;
  createdBy: string;
}
