'use client';
import { useState } from 'react';
import { mockATMs, Alert } from '@atm/shared';

type SimulationType = 'atm_down' | 'atm_up' | 'cash_low';

const simulationConfig: Record<SimulationType, {
  label: string; desc: string; icon: string; severity: Alert['severity'];
  borderColor: string; bgColor: string; textColor: string;
}> = {
  atm_down: {
    label: 'ATM Down',
    desc: 'Marks the ATM as offline and unreachable',
    icon: '⊗',
    severity: 'critical',
    borderColor: 'border-red-400',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  atm_up: {
    label: 'ATM Up',
    desc: 'Restores the ATM to online service',
    icon: '⊕',
    severity: 'low',
    borderColor: 'border-emerald-400',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  cash_low: {
    label: 'Cash Low',
    desc: 'Triggers a critical cash replenishment alert',
    icon: '◎',
    severity: 'high',
    borderColor: 'border-amber-400',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
};

const severityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-emerald-100 text-emerald-700',
};

export default function AlertsSimulatorPage() {
  const [selectedATM, setSelectedATM] = useState(mockATMs[0].id);
  const [simType, setSimType] = useState<SimulationType>('atm_down');
  const [triggered, setTriggered] = useState<Array<Alert & { simTime: string }>>([]);

  const handleTrigger = () => {
    const atm = mockATMs.find((a) => a.id === selectedATM)!;
    const cfg = simulationConfig[simType];
    const newAlert: Alert & { simTime: string } = {
      id: `sim-${Date.now()}`,
      atmId: atm.id,
      atmName: atm.name,
      type: simType,
      message:
        simType === 'atm_down' ? `[SIM] ATM "${atm.name}" has gone offline.`
        : simType === 'atm_up'  ? `[SIM] ATM "${atm.name}" restored to service.`
                                 : `[SIM] ATM "${atm.name}" cash level critically low.`,
      severity: cfg.severity,
      timestamp: new Date().toISOString(),
      resolved: false,
      simTime: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setTriggered((prev) => [newAlert, ...prev]);
  };

  return (
    <div className="p-6 space-y-5">

      {/* Info banner */}
      <div className="bg-bop-50 border border-bop-100 rounded-xl px-5 py-3 flex items-start gap-3">
        <span className="text-bop-600 text-lg mt-0.5">ℹ</span>
        <div>
          <p className="text-sm font-semibold text-bop-800">Simulation Mode</p>
          <p className="text-xs text-bop-600 mt-0.5">
            Alerts triggered here are simulated only — no actual ATM state is modified. Use this to test notification workflows and escalation paths.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Trigger panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="text-sm font-bold text-gray-900">Trigger Alert</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select an ATM and event type, then fire</p>
          </div>
          <div className="p-5 space-y-5">
            {/* ATM selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Select ATM</label>
              <select
                value={selectedATM}
                onChange={(e) => setSelectedATM(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bop-500 focus:border-transparent bg-white"
              >
                {mockATMs.map((atm) => (
                  <option key={atm.id} value={atm.id}>
                    {atm.name} — {atm.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Event type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Event Type</label>
              <div className="space-y-2">
                {(Object.entries(simulationConfig) as [SimulationType, typeof simulationConfig[SimulationType]][]).map(([type, cfg]) => {
                  const isSelected = simType === type;
                  return (
                    <label
                      key={type}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? `${cfg.borderColor} ${cfg.bgColor}`
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <input type="radio" name="simType" value={type} checked={isSelected} onChange={() => setSimType(type)} className="hidden" />
                      <span className={`text-xl mt-0.5 ${isSelected ? cfg.textColor : 'text-gray-400'}`}>{cfg.icon}</span>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${isSelected ? cfg.textColor : 'text-gray-700'}`}>{cfg.label}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{cfg.desc}</div>
                      </div>
                      <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded-full ${severityStyles[cfg.severity]}`}>
                        {cfg.severity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Fire button */}
            <button
              onClick={handleTrigger}
              className="w-full bg-bop-600 hover:bg-bop-700 active:bg-bop-800 text-white rounded-xl py-3 font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              Fire Alert Simulation
            </button>
          </div>
        </div>

        {/* Log panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Simulation Log</h2>
              <p className="text-xs text-gray-400 mt-0.5">{triggered.length} event{triggered.length !== 1 ? 's' : ''} fired this session</p>
            </div>
            {triggered.length > 0 && (
              <button onClick={() => setTriggered([])} className="text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-1 rounded border border-gray-200 hover:border-red-200 transition-colors">
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px]">
            {triggered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-8">
                <div className="w-12 h-12 rounded-full bg-bop-50 border border-bop-100 flex items-center justify-center text-2xl mb-3">📭</div>
                <p className="text-sm font-medium text-gray-500">No simulations yet</p>
                <p className="text-xs text-gray-400 mt-1">Trigger an alert on the left to see results here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {triggered.map((alert, idx) => {
                  const cfg = simulationConfig[alert.type as SimulationType];
                  return (
                    <div key={alert.id} className={`flex gap-3 px-5 py-3 border-l-4 ${cfg.borderColor}`}>
                      <span className={`text-lg mt-0.5 ${cfg.textColor}`}>{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 truncate">{alert.atmName}</span>
                          {idx === 0 && <span className="text-[9px] bg-bop-100 text-bop-700 font-bold px-1.5 py-0.5 rounded">LATEST</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{alert.message}</div>
                        <div className="text-[10px] text-gray-400 mt-1">🕐 {alert.simTime}</div>
                      </div>
                      <span className={`shrink-0 self-start text-[10px] font-bold px-1.5 py-0.5 rounded ${severityStyles[alert.severity]}`}>
                        {alert.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

