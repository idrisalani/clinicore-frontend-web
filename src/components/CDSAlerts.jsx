// ============================================
// CDSAlerts.jsx — Clinical Decision Support Alert Panel
// File: frontend-web/src/components/CDSAlerts.jsx
//
// Drop into ConsultationForm.jsx alongside the
// "Medications Prescribed" section.
// ============================================

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, ShieldAlert, Activity, Pill } from 'lucide-react';

const LEVEL_CONFIG = {
  danger: {
    bg:     'bg-red-50',
    border: 'border-red-300',
    icon:   ShieldAlert,
    iconCl: 'text-red-600',
    text:   'text-red-800',
    badge:  'bg-red-100 text-red-800',
    label:  'Critical Alert',
  },
  warning: {
    bg:     'bg-amber-50',
    border: 'border-amber-300',
    icon:   AlertTriangle,
    iconCl: 'text-amber-600',
    text:   'text-amber-800',
    badge:  'bg-amber-100 text-amber-800',
    label:  'Warning',
  },
  info: {
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    icon:   Info,
    iconCl: 'text-blue-500',
    text:   'text-blue-700',
    badge:  'bg-blue-100 text-blue-700',
    label:  'Note',
  },
};

const TYPE_ICON = {
  allergy:     Pill,
  interaction: AlertCircle,
  vital:       Activity,
};

const TYPE_LABEL = {
  allergy:     'Allergy',
  interaction: 'Interaction',
  vital:       'Vital Sign',
};

const AlertItem = ({ alert, onAcknowledge, acknowledged }) => {
  const cfg     = LEVEL_CONFIG[alert.level] || LEVEL_CONFIG.info;
  const Icon    = cfg.icon;
  const TypeIcon = TYPE_ICON[alert.type] || AlertCircle;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border} ${acknowledged ? 'opacity-50' : ''} transition-opacity`}>
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.iconCl}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/60 text-slate-500 flex items-center gap-1`}>
            <TypeIcon style={{ width: 10, height: 10 }} />
            {TYPE_LABEL[alert.type]}
          </span>
        </div>
        <p className={`text-xs font-medium leading-relaxed ${cfg.text}`}>{alert.message}</p>
      </div>
      {!acknowledged && (
        <button
          type="button"
          onClick={() => onAcknowledge(alert)}
          className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 whitespace-nowrap flex-shrink-0 mt-0.5 transition-colors"
        >
          Noted
        </button>
      )}
    </div>
  );
};

const CDSAlerts = ({ alerts = [], className = '' }) => {
  const [acknowledged, setAcknowledged]   = useState(new Set());
  const [collapsed, setCollapsed]         = useState(false);

  if (alerts.length === 0) return null;

  const activeAlerts  = alerts.filter(a => !acknowledged.has(alertKey(a)));
  const dangerCount   = activeAlerts.filter(a => a.level === 'danger').length;
  const warningCount  = activeAlerts.filter(a => a.level === 'warning').length;

  const acknowledge = (alert) => {
    setAcknowledged(prev => new Set([...prev, alertKey(alert)]));
  };

  const acknowledgeAll = () => {
    setAcknowledged(new Set(alerts.map(alertKey)));
  };

  // Sort: danger first, then warning, then info
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 };
    return (order[a.level] ?? 3) - (order[b.level] ?? 3);
  });

  const headerBg    = dangerCount > 0 ? 'bg-red-600' : warningCount > 0 ? 'bg-amber-500' : 'bg-blue-500';
  const headerBorder = dangerCount > 0 ? 'border-red-300' : warningCount > 0 ? 'border-amber-300' : 'border-blue-200';

  return (
    <div className={`rounded-2xl border overflow-hidden ${headerBorder} ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className={`w-full flex items-center justify-between px-4 py-3 ${headerBg} text-white`}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-sm font-bold">
            Clinical Decision Support
          </span>
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
          {dangerCount > 0 && (
            <span className="bg-white text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {dangerCount} CRITICAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeAlerts.length > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); acknowledgeAll(); }}
              className="text-[11px] text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Acknowledge all
            </span>
          )}
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-white/80" />
            : <ChevronUp   className="w-4 h-4 text-white/80" />
          }
        </div>
      </button>

      {/* Alert list */}
      {!collapsed && (
        <div className="p-3 space-y-2 bg-white">
          {sortedAlerts.map((alert, i) => (
            <AlertItem
              key={i}
              alert={alert}
              onAcknowledge={acknowledge}
              acknowledged={acknowledged.has(alertKey(alert))}
            />
          ))}
          {activeAlerts.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">
              All alerts acknowledged. Proceed with clinical judgement.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Stable key for dedup/acknowledgement
const alertKey = (a) => `${a.type}-${a.level}-${a.message}`;

export default CDSAlerts;