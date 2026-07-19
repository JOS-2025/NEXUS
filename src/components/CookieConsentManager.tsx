import React from 'react';
import { 
  Cookie, 
  Shield, 
  Activity, 
  Settings, 
  Lock, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  X, 
  ArrowRight, 
  Trash2, 
  RefreshCw, 
  FileText, 
  AlertCircle, 
  Info,
  Check
} from 'lucide-react';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  consentVersion: string;
  consentDate: string | null;
  updatedAt?: string;
}

const CURRENT_CONSENT_VERSION = "1.0.0";

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
  consentVersion: CURRENT_CONSENT_VERSION,
  consentDate: null
};

// Global Script Simulator to track script loads dynamically
export interface SimulatedScript {
  id: string;
  name: string;
  provider: string;
  category: 'essential' | 'analytics' | 'marketing' | 'functional';
  description: string;
  status: 'Loaded' | 'Blocked';
}

export const INITIAL_SIMULATED_SCRIPTS: SimulatedScript[] = [
  { id: 'auth', name: 'NexusAuth Secure Engine', provider: 'Auth0 / Local Session', category: 'essential', description: 'Manages user credentials, active sessions, and secure login states.', status: 'Loaded' },
  { id: 'security', name: 'Device Fingerprint CSRF Shield', provider: 'Platform Security', category: 'essential', description: 'Prevents cross-site request forgery and brute force login attempts.', status: 'Loaded' },
  { id: 'ga', name: 'Google Analytics v4', provider: 'Google LLC', category: 'analytics', description: 'Tracks page engagement metrics, active users, and content scroll depth.', status: 'Blocked' },
  { id: 'clarity', name: 'Microsoft Clarity Heatmaps', provider: 'Microsoft Corp', category: 'analytics', description: 'Captures screen hot-zones and visual reader pathways anonymously.', status: 'Blocked' },
  { id: 'meta', name: 'Meta Core Pixel', provider: 'Meta Platforms Inc.', category: 'marketing', description: 'Analyzes click-through performance from social channels and newsletter funnels.', status: 'Blocked' },
  { id: 'linkedin', name: 'LinkedIn Insight Tag', provider: 'LinkedIn Corp', category: 'marketing', description: 'Tracks referral traffic from professional developer networks.', status: 'Blocked' },
  { id: 'affiliate', name: 'Affiliate Partner Link Tracker', provider: 'Nexus Publishing Network', category: 'marketing', description: 'Validates publisher checkout credentials to credit partner discounts.', status: 'Blocked' },
  { id: 'theme', name: 'Ambient UI Theme preference', provider: 'Local Settings Store', category: 'functional', description: 'Caches user dashboard slate layouts and dark/light system choices.', status: 'Blocked' }
];

interface CookieConsentManagerProps {
  activeEmail: string;
  userRole: string;
  onOpenModalTrigger?: (open: () => void) => void;
  onRefreshTrigger?: () => void;
}

// -------------------------------------------------------------
// CORE COOKIE UTILITIES
// -------------------------------------------------------------
export function getLocalConsent(): CookieConsent {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const local = localStorage.getItem('nexus_cookie_consent');
    if (local) {
      const parsed = JSON.parse(local) as CookieConsent;
      // If version is different, prompt again
      if (parsed.consentVersion === CURRENT_CONSENT_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read local cookie consent', e);
  }
  return DEFAULT_CONSENT;
}

export function saveLocalConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem('nexus_cookie_consent', JSON.stringify(consent));
    // Trigger custom event to notify components
    window.dispatchEvent(new CustomEvent('nexus_cookie_consent_changed', { detail: consent }));
  } catch (e) {
    console.error('Failed to save local cookie consent', e);
  }
}

export function clearLocalConsent(): void {
  try {
    localStorage.removeItem('nexus_cookie_consent');
    window.dispatchEvent(new CustomEvent('nexus_cookie_consent_changed', { detail: DEFAULT_CONSENT }));
  } catch (e) {
    console.error('Failed to clear local cookie consent', e);
  }
}

// Helper to determine if a specific cookie category is allowed
export function isCookieAllowed(category: 'essential' | 'analytics' | 'marketing' | 'functional'): boolean {
  if (category === 'essential') return true;
  const consent = getLocalConsent();
  if (!consent.consentDate) return false; // Consent not given yet
  return !!consent[category];
}

// -------------------------------------------------------------
// MAIN PREFERENCES COMPONENT
// -------------------------------------------------------------
export function CookiePreferencesPage({ activeEmail, userRole }: CookieConsentManagerProps) {
  const [consent, setConsent] = React.useState<CookieConsent>(DEFAULT_CONSENT);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);
  const [simulatedScripts, setSimulatedScripts] = React.useState<SimulatedScript[]>(INITIAL_SIMULATED_SCRIPTS);
  const [recentLogs, setRecentLogs] = React.useState<{ timestamp: string; action: string; details: string }[]>([]);

  // Load and sync consent
  const refreshConsent = React.useCallback(async () => {
    const local = getLocalConsent();
    setConsent(local);

    // Update simulated scripts status
    setSimulatedScripts(prev => prev.map(s => {
      const isAllowed = s.category === 'essential' || local[s.category];
      return { ...s, status: isAllowed ? 'Loaded' : 'Blocked' };
    }));

    // If user is logged in and not anonymous, try syncing with the DB
    if (activeEmail && activeEmail !== 'anonymous') {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/cookie-consent?email=${encodeURIComponent(activeEmail)}`);
        if (res.ok) {
          const dbConsent = await res.json();
          if (dbConsent && dbConsent.consentDate) {
            // Compare timestamps, keep the latest
            const localTime = local.consentDate ? new Date(local.consentDate).getTime() : 0;
            const dbTime = dbConsent.consentDate ? new Date(dbConsent.consentDate).getTime() : 0;
            
            if (dbTime > localTime) {
              saveLocalConsent(dbConsent);
              setConsent(dbConsent);
              addLog("Sync", "Restored preferences from server profile database", `Version ${dbConsent.consentVersion}`);
            } else if (localTime > dbTime && local.consentDate) {
              // Local is newer, push to DB
              await pushConsentToDB(activeEmail, local);
              addLog("Sync", "Synchronized local preferences to secure cloud server", `Synced`);
            }
          }
        }
      } catch (err) {
        console.error("DB consent fetch error:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [activeEmail]);

  const addLog = (action: string, text: string, details: string) => {
    setRecentLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action,
        details: `${text} (${details})`
      },
      ...prev.slice(0, 9)
    ]);
  };

  React.useEffect(() => {
    refreshConsent();
    addLog("Session", "Consent framework initialized", `Using Local Storage & Server DB`);
    
    // Listen for custom change events
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<CookieConsent>;
      setConsent(customEvent.detail);
      setSimulatedScripts(prev => prev.map(s => {
        const isAllowed = s.category === 'essential' || customEvent.detail[s.category];
        return { ...s, status: isAllowed ? 'Loaded' : 'Blocked' };
      }));
    };

    window.addEventListener('nexus_cookie_consent_changed', handleConsentChange);
    return () => window.removeEventListener('nexus_cookie_consent_changed', handleConsentChange);
  }, [refreshConsent]);

  const pushConsentToDB = async (email: string, targetConsent: CookieConsent) => {
    try {
      const res = await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...targetConsent
        })
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Consent pushed to DB successfully", data);
        return true;
      }
    } catch (e) {
      console.error("Failed to push consent to DB", e);
    }
    return false;
  };

  const handleToggle = async (category: 'analytics' | 'marketing' | 'functional') => {
    const updated = {
      ...consent,
      [category]: !consent[category],
      consentDate: new Date().toISOString(),
      consentVersion: CURRENT_CONSENT_VERSION
    };
    
    saveLocalConsent(updated);
    setConsent(updated);
    addLog("Toggle", `Toggled ${category.toUpperCase()} cookies`, updated[category] ? "Enabled" : "Disabled");

    if (activeEmail && activeEmail !== 'anonymous') {
      setIsSyncing(true);
      setSyncStatus("Saving settings on cloud...");
      const success = await pushConsentToDB(activeEmail, updated);
      setIsSyncing(false);
      setSyncStatus(success ? "Preferences synced to account!" : "Saved locally (Offline)");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleAcceptAll = async () => {
    const updated: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentVersion: CURRENT_CONSENT_VERSION,
      consentDate: new Date().toISOString()
    };

    saveLocalConsent(updated);
    setConsent(updated);
    addLog("Opt-In", "Accepted all cookie categories", "Consent granted");

    if (activeEmail && activeEmail !== 'anonymous') {
      setIsSyncing(true);
      setSyncStatus("Syncing Accept All...");
      await pushConsentToDB(activeEmail, updated);
      setIsSyncing(false);
      setSyncStatus("All cookies authorized!");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleWithdrawAll = async () => {
    const updated: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentVersion: CURRENT_CONSENT_VERSION,
      consentDate: new Date().toISOString()
    };

    saveLocalConsent(updated);
    setConsent(updated);
    addLog("Opt-Out", "Withdrew non-essential consent", "Strict Privacy Enforcement");

    if (activeEmail && activeEmail !== 'anonymous') {
      setIsSyncing(true);
      setSyncStatus("Syncing Opt-Out...");
      await pushConsentToDB(activeEmail, updated);
      setIsSyncing(false);
      setSyncStatus("Non-essential cookies blocked!");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-in fade-in duration-300">
      
      {/* Hero Header Area */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight flex items-center gap-3">
              <Cookie className="w-8 h-8 text-indigo-500 animate-pulse" />
              <span>Cookie Preferences Dashboard</span>
            </h1>
            <p className="text-xs text-gray-400">
              Manage your cookie choices, view live-loaded tracking script telemetry, and review privacy logs.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {isSyncing ? (
              <span className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing Cloud...</span>
              </span>
            ) : syncStatus ? (
              <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{syncStatus}</span>
              </span>
            ) : activeEmail && activeEmail !== 'anonymous' ? (
              <span className="text-[11px] font-mono text-gray-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
                Connected: <span className="text-indigo-400">{activeEmail}</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-gray-500 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-full">
                Anonymous Mode (Local Cache Only)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct preference controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-sans font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Granular Privacy Switches</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl text-[10px] font-bold text-white"
                >
                  Accept All
                </button>
                <button
                  onClick={handleWithdrawAll}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 transition-colors border border-white/5 rounded-xl text-[10px] font-bold text-slate-300"
                >
                  Reject Optional
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              We respect your digital sovereignty. Use the toggles below to configure what categories of tracking assets the platform is authorized to load. Changes take effect immediately.
            </p>

            {/* Cookie Categories Switch Grid */}
            <div className="space-y-4">
              
              {/* Category 1: Essential */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Essential Operations (Always Required)</span>
                  </span>
                  <p className="text-[11px] text-gray-400 leading-normal max-w-md">
                    Necessary for core application security, subscriber credentials authentication, and preventing CSRF exploits. Cannot be toggled off.
                  </p>
                </div>
                <div className="flex items-center text-xs font-bold text-indigo-400 uppercase tracking-wider select-none shrink-0">
                  <span>Mandatory</span>
                </div>
              </div>

              {/* Category 2: Analytics */}
              <div 
                className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4 hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => handleToggle('analytics')}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Audience Analytics & Traffic Metrics</span>
                  </span>
                  <p className="text-[11px] text-gray-400 leading-normal max-w-md">
                    Helps our editorial desk analyze reader density, which articles are read completely, and capture page speed diagnostic events.
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggle('analytics'); }}
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none shrink-0"
                  aria-label="Toggle Analytics Cookies"
                >
                  {consent.analytics ? (
                    <ToggleRight className="w-9 h-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Category 3: Marketing */}
              <div 
                className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4 hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => handleToggle('marketing')}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Marketing, Pixels & Affiliate Trackers</span>
                  </span>
                  <p className="text-[11px] text-gray-400 leading-normal max-w-md">
                    Enables proper attribution of affiliate partner deals and discount coupon codes in our AI Tools resources library.
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggle('marketing'); }}
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none shrink-0"
                  aria-label="Toggle Marketing Cookies"
                >
                  {consent.marketing ? (
                    <ToggleRight className="w-9 h-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Category 4: Functional */}
              <div 
                className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4 hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => handleToggle('functional')}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Cookie className="w-3.5 h-3.5 text-pink-400" />
                    <span>Functional & Personalization Cache</span>
                  </span>
                  <p className="text-[11px] text-gray-400 leading-normal max-w-md">
                    Saves visual layout states, theme presets, default reading speed metrics, and specific navigation preferences between tabs.
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggle('functional'); }}
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none shrink-0"
                  aria-label="Toggle Functional Cookies"
                >
                  {consent.functional ? (
                    <ToggleRight className="w-9 h-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

            </div>

            {/* Current status summary card */}
            <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest">Active Consent Certificate</span>
                <div className="text-[11px] text-slate-300">
                  {consent.consentDate ? (
                    <span>Authorized on <strong className="text-white font-mono">{new Date(consent.consentDate).toLocaleDateString()}</strong> at <strong className="text-white font-mono">{new Date(consent.consentDate).toLocaleTimeString()}</strong></span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Consent not explicitly recorded yet. Standard defaults active.</span>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono text-gray-500 text-left sm:text-right shrink-0">
                <div>Framework version: {consent.consentVersion}</div>
                <div>Server status: Securely Logged</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Script Shield (Simulating script loads) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Loading Telemetry */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Interactive Script Shield</span>
              </h3>
              <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                Live Simulation
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-normal">
              Toggle the settings on the left to see how our micro-gateways block tracking script execution before consent is authorized.
            </p>

            {/* Simulated scripts list */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {simulatedScripts.map((s) => (
                <div 
                  key={s.id} 
                  className={`border p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                    s.status === 'Loaded' 
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-200' 
                      : 'bg-rose-500/5 border-rose-500/10 text-slate-400'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[11px] text-white truncate">{s.name}</span>
                      <span className={`text-[8px] px-1 py-0.5 font-mono rounded capitalize select-none shrink-0 ${
                        s.category === 'essential' ? 'bg-indigo-500/15 text-indigo-300' :
                        s.category === 'analytics' ? 'bg-emerald-500/15 text-emerald-300' :
                        s.category === 'marketing' ? 'bg-amber-500/15 text-amber-300' :
                        'bg-pink-500/15 text-pink-300'
                      }`}>
                        {s.category}
                      </span>
                    </div>
                    <span className="block text-[9px] text-gray-400 truncate font-mono">Provider: {s.provider}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Loaded' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                    <span className={`text-[9px] font-bold font-mono ${s.status === 'Loaded' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.status === 'Loaded' ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Audit Trail Logs */}
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Real-time Compliance Logs</span>
            </h3>
            
            <div className="bg-slate-950/40 rounded-xl p-3 h-28 overflow-y-auto space-y-1.5 scrollbar-none font-mono text-[9px] text-gray-400 border border-white/5">
              {recentLogs.length === 0 ? (
                <div className="text-gray-600 italic">Listening for user consent adjustments...</div>
              ) : (
                recentLogs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 border-b border-white/5 pb-1 last:border-0 last:pb-0">
                    <span className="text-indigo-400 shrink-0">[{l.timestamp}]</span>
                    <span className="text-emerald-400 shrink-0 font-bold">{l.action}:</span>
                    <span className="truncate text-slate-300">{l.details}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// -------------------------------------------------------------
// PERSISTENT CONSENT BANNER COMPONENT
// -------------------------------------------------------------
interface CookieConsentBannerProps {
  activeEmail: string;
  onOpenPreferences: () => void;
}

export function CookieConsentBanner({ activeEmail, onOpenPreferences }: CookieConsentBannerProps) {
  const [visible, setVisible] = React.useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = React.useState(false);
  const [modalConsent, setModalConsent] = React.useState<CookieConsent>(DEFAULT_CONSENT);

  React.useEffect(() => {
    // Check if consent given already
    const local = getLocalConsent();
    if (!local.consentDate) {
      // Delay display slightly for smoother landing
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = async () => {
    const updated: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      consentVersion: CURRENT_CONSENT_VERSION,
      consentDate: new Date().toISOString()
    };
    saveLocalConsent(updated);
    setVisible(false);

    if (activeEmail && activeEmail !== 'anonymous') {
      try {
        await fetch('/api/cookie-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: activeEmail, ...updated })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRejectAll = async () => {
    const updated: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentVersion: CURRENT_CONSENT_VERSION,
      consentDate: new Date().toISOString()
    };
    saveLocalConsent(updated);
    setVisible(false);

    if (activeEmail && activeEmail !== 'anonymous') {
      try {
        await fetch('/api/cookie-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: activeEmail, ...updated })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenCustomize = () => {
    const local = getLocalConsent();
    setModalConsent(local);
    setShowCustomizeModal(true);
  };

  const handleSavePreferences = async () => {
    const updated = {
      ...modalConsent,
      consentDate: new Date().toISOString(),
      consentVersion: CURRENT_CONSENT_VERSION
    };
    saveLocalConsent(updated);
    setShowCustomizeModal(false);
    setVisible(false);

    if (activeEmail && activeEmail !== 'anonymous') {
      try {
        await fetch('/api/cookie-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: activeEmail, ...updated })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Slide-in responsive banner */}
      <div 
        id="cookie-consent-banner"
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md border-t border-indigo-500/20 shadow-2xl text-left animate-in slide-in-from-bottom duration-500"
        role="alert"
        aria-live="polite"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Banner Text */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shrink-0 mt-0.5">
              <Cookie className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-3xl">
              <h4 className="font-sans font-bold text-sm text-white flex items-center gap-1.5">
                <span>Digital Privacy Protection Consent</span>
                <span className="text-[9px] font-mono font-normal bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full select-none">GDPR / CCPA Compliant</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                We utilize essential cookies to keep you safely logged in. With your permission, we also deploy performance analytics and marketing tracking networks to optimize coupon attribution discounts. Read our <button onClick={onOpenPreferences} className="text-indigo-400 underline hover:text-indigo-300 focus:outline-none">Cookie Policy</button> and <button onClick={onOpenPreferences} className="text-indigo-400 underline hover:text-indigo-300 focus:outline-none">Privacy Policy</button>.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={handleOpenCustomize}
              className="px-4 py-2.5 bg-slate-900 border border-white/5 text-slate-300 rounded-xl text-xs font-bold hover:text-white hover:border-white/10 transition-all focus:outline-none"
            >
              Customize Choices
            </button>
            <button
              onClick={handleRejectAll}
              className="px-4 py-2.5 bg-slate-900 border border-white/5 text-slate-300 rounded-xl text-xs font-bold hover:text-white hover:border-white/10 transition-all focus:outline-none"
            >
              Reject Optional
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all focus:outline-none"
            >
              Accept All
            </button>
          </div>

        </div>
      </div>

      {/* Customize Preferences Modal overlay */}
      {showCustomizeModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div className="bg-slate-900 border border-white/5 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <h3 id="cookie-modal-title" className="font-sans font-bold text-base text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <span>Customize Cookie Consent</span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Select which categories of cookies you permit. Essential cookies are active by law.
                </p>
              </div>
              <button 
                onClick={() => setShowCustomizeModal(false)}
                className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Granular Preferences Body */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              
              {/* Essential */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Essential Session Cookies</span>
                  </span>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Manages active logins, authenticates secure connection tokens, and prevents system forgery. Required.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest shrink-0 mt-1">Always Active</span>
              </div>

              {/* Analytics */}
              <div 
                className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4 hover:border-white/10 transition-all cursor-pointer"
                onClick={() => setModalConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
              >
                <div className="space-y-1 text-left">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Performance & Analytics Cookies</span>
                  </span>
                  <p className="text-[10px] text-gray-400 leading-normal font-sans">
                    Enables us to track article read completion rates and compile anonymous analytics maps.
                  </p>
                </div>
                <button
                  type="button"
                  className="focus:outline-none shrink-0"
                  aria-label="Toggle Analytics"
                >
                  {modalConsent.analytics ? (
                    <ToggleRight className="w-9 h-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Marketing */}
              <div 
                className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4 hover:border-white/10 transition-all cursor-pointer"
                onClick={() => setModalConsent(prev => ({ ...prev, marketing: !prev.marketing }))}
              >
                <div className="space-y-1 text-left">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Affiliate & Marketing Cookies</span>
                  </span>
                  <p className="text-[10px] text-gray-400 leading-normal font-sans">
                    Stores secure cookie trackers for product affiliates to properly apply direct reader discount codes.
                  </p>
                </div>
                <button
                  type="button"
                  className="focus:outline-none shrink-0"
                  aria-label="Toggle Marketing"
                >
                  {modalConsent.marketing ? (
                    <ToggleRight className="w-9 h-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Functional */}
              <div 
                className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4 hover:border-white/10 transition-all cursor-pointer"
                onClick={() => setModalConsent(prev => ({ ...prev, functional: !prev.functional }))}
              >
                <div className="space-y-1 text-left">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cookie className="w-3.5 h-3.5 text-pink-400" />
                    <span>Dashboard Preferences Cookies</span>
                  </span>
                  <p className="text-[10px] text-gray-400 leading-normal font-sans">
                    Caches customized slider thresholds, reader profiles, dashboard states, and sidebar layout settings.
                  </p>
                </div>
                <button
                  type="button"
                  className="focus:outline-none shrink-0"
                  aria-label="Toggle Functional"
                >
                  {modalConsent.functional ? (
                    <ToggleRight className="w-9 h-9 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white hover:bg-slate-700 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors focus:outline-none"
              >
                Save My Preferences
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
