import { ATM, Alert, Ticket, BroadcastNotification, AnnouncementBanner, ATMStatus } from './types';

// ─── Deterministic pseudo-random helpers ────────────────────────────────────
// Produces a value in [0, 1) for a given integer seed — no Math.random() so
// the generated dataset is identical on every module load.
function r(n: number): number {
  return Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;
}
function ri(n: number, max: number): number {
  return Math.floor(r(n) * max);
}

// ─── Reference data (BOP Pakistan context) ──────────────────────────────────
const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Gujranwala', 'Sialkot', 'Peshawar', 'Quetta', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Kasur', 'Sahiwal', 'Mardan', 'Abbottabad', 'Gujrat', 'Muzaffargarh',
  'Chiniot', 'Narowal', 'Jhelum', 'Chakwal', 'Okara', 'Mianwali',
  'Attock', 'Hafizabad', 'Khanewal', 'Vehari', 'Bhakkar', 'Layyah',
  'DG Khan', 'Nowshera', 'Kohat', 'Bannu',
];

const LOCS = [
  'Main Branch', 'City Branch', 'Railway Station', 'Airport Terminal',
  'Hospital Complex', 'University Campus', 'Shopping Mall', 'Commercial Area',
  'Cantonment', 'Bus Terminal', 'Metro Station', 'Old City', 'New Town',
  'Garden Town', 'Model Town', 'DHA Branch', 'Bahria Town', 'Gulberg',
  'Johar Town', 'Wapda Town', 'Township', 'Saddar', 'Cantt Area',
  'Industrial Zone', 'Toll Plaza', 'Food Street',
];

const MODELS = [
  'NCR SelfServ 87', 'NCR SelfServ 34', 'Diebold Nixdorf DN200',
  'Diebold Nixdorf CS 5500', 'Wincor Nixdorf ProCash 2050',
  'Hyosung MoniMax 7600', 'Hyosung NH-2700CE', 'GRG Banking H22N',
];

const ALERT_MSGS: Record<ATMStatus, string[]> = {
  offline: [
    'ATM is offline. Network connection lost.',
    'ATM unresponsive – power supply fault detected.',
    'Communication failure. ATM not responding to heartbeat.',
  ],
  cash_low: [
    'Cash level critically low. Immediate replenishment required.',
    'Cash below 20% threshold. Schedule replenishment.',
    'Cash reserve running low. Refill within 4 hours.',
  ],
  warning: [
    'Card reader hardware warning detected.',
    'Printer paper near end. Refill required.',
    'Display unit flickering. Inspection needed.',
    'Cash dispenser jam (auto-cleared). Monitor closely.',
  ],
  maintenance: [
    'Scheduled maintenance window active.',
    'Technician on-site. Routine service in progress.',
  ],
  online: [],
};

// ─── ATM generator ───────────────────────────────────────────────────────────
// Status distribution: 68% online | 12% cash_low | 10% warning | 6% maintenance | 4% offline
function genStatus(i: number): ATMStatus {
  const v = r(i * 31);
  if (v < 0.68) return 'online';
  if (v < 0.80) return 'cash_low';
  if (v < 0.90) return 'warning';
  if (v < 0.96) return 'maintenance';
  return 'offline';
}

function devStat(status: ATMStatus, seed: number): 'ok' | 'error' | 'warning' {
  if (status === 'offline') return r(seed) < 0.6 ? 'error' : 'warning';
  if (status === 'warning') {
    const v = r(seed);
    return v < 0.2 ? 'error' : v < 0.5 ? 'warning' : 'ok';
  }
  return 'ok';
}

function generateATMs(): ATM[] {
  const atms: ATM[] = [];
  for (let i = 1; i <= 1000; i++) {
    const city   = CITIES[ri(i * 7,  CITIES.length)];
    const loc    = LOCS[ri(i * 13,   LOCS.length)];
    const model  = MODELS[ri(i * 17, MODELS.length)];
    const status = genStatus(i);

    const cashLevel =
      status === 'offline'     ? ri(i * 5, 12) :
      status === 'cash_low'    ? 5  + ri(i * 5, 20) :
      status === 'maintenance' ? 20 + ri(i * 5, 40) :
      status === 'warning'     ? 30 + ri(i * 5, 50) :
                                 40 + ri(i * 5, 58);

    const lastSeenMins =
      status === 'offline'     ? 30 + ri(i * 19, 120) :
      status === 'maintenance' ? 60 + ri(i * 23, 180) :
                                 ri(i * 3, 15);

    const id = `atm-${String(i).padStart(4, '0')}`;
    const serial = `${model.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${2018 + ri(i * 11, 7)}-${String(i).padStart(4, '0')}`;

    atms.push({
      id,
      name: `BOP ${loc} – ${city}`,
      location: city,
      address: `${loc}, ${city}`,
      status,
      cashLevel,
      lastSeen: new Date(Date.now() - lastSeenMins * 60 * 1000).toISOString(),
      model,
      serialNumber: serial,
      devices: {
        cardReader:    devStat(status, i * 37),
        printer:       devStat(status, i * 41),
        display:       devStat(status, i * 43),
        pinpad:        devStat(status, i * 47),
        cashDispenser: devStat(status, i * 53),
      },
      events: [],
      coordinates: {
        lat: 24 + r(i * 59) * 13,
        lng: 61 + r(i * 61) * 16,
      },
    });
  }
  return atms;
}

// ─── Alert generator ─────────────────────────────────────────────────────────
function generateAlerts(atms: ATM[]): Alert[] {
  const alerts: Alert[] = [];
  let idx = 0;

  // Active alerts — ~88% of non-online ATMs get one
  for (const atm of atms) {
    if (atm.status === 'online') continue;
    if (r(idx * 71) > 0.88) { idx++; continue; }

    const msgs     = ALERT_MSGS[atm.status];
    const msg      = msgs[ri(idx * 79, msgs.length)];
    const severity: Alert['severity'] =
      atm.status === 'offline'     ? 'critical' :
      atm.status === 'cash_low'    ? 'high'     :
      atm.status === 'warning'     ? 'medium'   : 'low';
    const type: Alert['type'] =
      atm.status === 'offline'     ? 'atm_down'     :
      atm.status === 'cash_low'    ? 'cash_low'     :
      atm.status === 'warning'     ? 'device_error' : 'maintenance';

    alerts.push({
      id:        `alert-${String(alerts.length + 1).padStart(4, '0')}`,
      atmId:     atm.id,
      atmName:   atm.name,
      type,
      message:   msg,
      severity,
      timestamp: new Date(Date.now() - (5 + ri(idx * 83, 180)) * 60 * 1000).toISOString(),
      resolved:  false,
    });
    idx++;
  }

  // ~100 resolved alerts from previously-fixed ATMs
  let resolvedCount = 0;
  for (const atm of atms) {
    if (resolvedCount >= 100) break;
    if (atm.status !== 'online') continue;
    if (r(idx * 89) > 0.18) { idx++; continue; }

    const prevStatus = (['offline', 'cash_low', 'warning'] as ATMStatus[])[ri(idx * 97, 3)];
    const msgs = ALERT_MSGS[prevStatus];
    alerts.push({
      id:        `alert-${String(alerts.length + 1).padStart(4, '0')}`,
      atmId:     atm.id,
      atmName:   atm.name,
      type:      prevStatus === 'offline' ? 'atm_up' : prevStatus === 'cash_low' ? 'cash_low' : 'device_error',
      message:   msgs[ri(idx * 101, msgs.length)],
      severity:  prevStatus === 'offline' ? 'critical' : prevStatus === 'cash_low' ? 'high' : 'medium',
      timestamp: new Date(Date.now() - (3 + ri(idx * 103, 24)) * 3600 * 1000).toISOString(),
      resolved:  true,
    });
    resolvedCount++;
    idx++;
  }

  return alerts;
}

export const mockATMs: ATM[]     = generateATMs();
export const mockAlerts: Alert[] = generateAlerts(mockATMs);

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-1001',
    atmId: 'atm-0003',
    atmName: 'BOP Shopping Mall – Lahore',
    title: 'ATM completely offline - power supply fault',
    description: 'ATM has gone offline. Power supply fault detected. On-site technician dispatched.',
    status: 'in_progress',
    priority: 'critical',
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    assignee: 'John Tech',
  },
  {
    id: 'TKT-1002',
    atmId: 'atm-0002',
    atmName: 'BOP Airport Terminal – Karachi',
    title: 'Cash replenishment required',
    description: 'ATM cash level at 12%. Schedule immediate replenishment.',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignee: 'Cash Team',
  },
  {
    id: 'TKT-1003',
    atmId: 'atm-0004',
    atmName: 'BOP University Campus – Islamabad',
    title: 'Display flickering - requires inspection',
    description: 'Screen flickering issues reported by multiple users. Possible display unit failure.',
    status: 'open',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'TKT-1004',
    atmId: 'atm-0006',
    atmName: 'BOP Hospital Complex – Lahore',
    title: 'Scheduled maintenance - card reader check',
    description: 'Routine maintenance for card reader component. Estimated 2 hours.',
    status: 'in_progress',
    priority: 'low',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignee: 'Maintenance Team',
  },
  {
    id: 'TKT-1005',
    atmId: 'atm-0001',
    atmName: 'BOP Main Branch – Lahore',
    title: 'Annual software update completed',
    description: 'Firmware and software updated to latest version. All systems functional.',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    assignee: 'IT Team',
  },
];

export const mockBroadcastNotifications: BroadcastNotification[] = [
  {
    id: 'notif-001',
    title: 'Scheduled Maintenance – Downtown Branch ATM',
    body: 'The ATM at Downtown Branch will be unavailable on 16 May from 02:00–04:00 AM for routine maintenance. We apologise for the inconvenience.',
    audience: 'all',
    audienceLabel: 'All App Users',
    channel: 'both',
    status: 'sent',
    sentAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    sentCount: 18420,
    createdBy: 'Imran Khan',
  },
  {
    id: 'notif-002',
    title: 'New Feature: ATM Finder Now Live!',
    body: 'You can now locate the nearest BOP ATM in real-time using the ATM Finder feature in the app. Try it now!',
    audience: 'app_users',
    audienceLabel: 'Mobile App Users',
    channel: 'push',
    status: 'sent',
    sentAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    sentCount: 18420,
    createdBy: 'Ayesha Malik',
  },
  {
    id: 'notif-003',
    title: 'System-wide Update Tonight',
    body: 'A system update will be performed tonight between 01:00–03:00 AM. Some services may be briefly unavailable.',
    audience: 'all',
    audienceLabel: 'All App Users',
    channel: 'in_app',
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    createdBy: 'Imran Khan',
  },
  {
    id: 'notif-004',
    title: 'Eid Mubarak – Special Cash Withdrawal Limit',
    body: 'In celebration of Eid ul-Adha, daily ATM withdrawal limits have been enhanced to PKR 50,000 from 15–17 June.',
    audience: 'app_users',
    audienceLabel: 'Mobile App Users',
    channel: 'both',
    status: 'draft',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdBy: 'Sara Hussain',
  },
];

export const mockAnnouncementBanners: AnnouncementBanner[] = [
  {
    id: 'banner-001',
    title: 'Eid Special: Enhanced Limits',
    message: 'Enjoy enhanced daily withdrawal limits of PKR 50,000 during Eid. Valid 15–17 June.',
    type: 'promo',
    isActive: true,
    priority: 1,
    startsAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    targetScreen: 'home',
    ctaLabel: 'Learn More',
    ctaUrl: 'https://bop.com.pk/eid-offer',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'Ayesha Malik',
  },
  {
    id: 'banner-002',
    title: 'System Maintenance Tonight',
    message: 'Planned maintenance on 16 May, 01:00–03:00 AM. Some ATMs may be temporarily unavailable.',
    type: 'maintenance',
    isActive: true,
    priority: 2,
    startsAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    targetScreen: 'all_screens',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    createdBy: 'Imran Khan',
  },
  {
    id: 'banner-003',
    title: 'New: ATM Finder Feature',
    message: 'Locate the nearest BOP ATM instantly with our new real-time ATM Finder. Available in the app now.',
    type: 'info',
    isActive: false,
    priority: 3,
    startsAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    targetScreen: 'home',
    ctaLabel: 'Find ATM',
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'Zain Ahmed',
  },
  {
    id: 'banner-004',
    title: 'Service Disruption – Airport ATM',
    message: 'The ATM at Airport Terminal 1 is currently experiencing low cash. A refill team has been dispatched.',
    type: 'warning',
    isActive: true,
    priority: 1,
    startsAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    targetScreen: 'atm_finder',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    createdBy: 'Imran Khan',
  },
];

