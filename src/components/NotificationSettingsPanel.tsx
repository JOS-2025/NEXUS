import React from 'react';
import { 
  Mail, 
  Bell, 
  Smartphone, 
  Check, 
  Loader2, 
  Sparkles, 
  Info, 
  ShieldCheck 
} from 'lucide-react';

interface NotificationSettingsPanelProps {
  activeEmail: string;
}

export default function NotificationSettingsPanel({ activeEmail }: NotificationSettingsPanelProps) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  
  // Grid preferences structure: categories x channels
  const [preferences, setPreferences] = React.useState<Record<string, { inApp: boolean; push: boolean; email: boolean }>>({
    'Articles': { inApp: true, push: true, email: true },
    'AI News': { inApp: true, push: true, email: true },
    'Comments': { inApp: true, push: false, email: false },
    'Replies': { inApp: true, push: true, email: true },
    'Resources': { inApp: true, push: false, email: true },
    'System': { inApp: true, push: true, email: false },
    'Security': { inApp: true, push: true, email: true }
  });

  React.useEffect(() => {
    if (!activeEmail) return;
    
    const loadPreferences = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/notifications/preferences?email=${encodeURIComponent(activeEmail)}`);
        if (res.ok) {
          const data = await res.json();
          // Transform saved preferences into our state structure if they exist
          if (data && data.categories) {
            setPreferences(data.categories);
          }
        }
      } catch (e) {
        console.error("Failed to load user notification preferences", e);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [activeEmail]);

  const handleToggle = (category: string, channel: 'inApp' | 'push' | 'email') => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmail) return;

    try {
      setSaving(true);
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeEmail,
          categories: preferences
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        // Dispatch event so other notification listeners get notified
        window.dispatchEvent(new Event('nexus_notifications_refreshed'));
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save user notification preferences", e);
    } finally {
      setSaving(false);
    }
  };

  const categoriesList = Object.keys(preferences);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-xs font-mono">Syncing Engagement Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="text-left">
          <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-1.5">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Audience Engagement Preference Matrix</span>
          </h3>
          <p className="text-[11px] text-slate-400">Customize how, when, and where you receive updates from NeuraPulse.</p>
        </div>
        
        {/* User Badge */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-850 px-3 py-1 rounded-xl shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-mono text-[10px] text-slate-350">{activeEmail}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-left">
        {/* Preference Matrix Table */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">
                  <th className="py-3 px-4">Alert Category</th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Bell className="w-3.5 h-3.5 text-indigo-400" />
                      <span>In-App</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Push</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Email</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs font-sans">
                {categoriesList.map((cat) => (
                  <tr key={cat} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-200 block">{cat}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {cat === 'Articles' && 'Instant alerts when creators post new articles.'}
                        {cat === 'AI News' && 'Major breakthroughs and trending AI products digests.'}
                        {cat === 'Comments' && 'Discussions and threads on your publications.'}
                        {cat === 'Replies' && 'Notifications when someone replies to your comment.'}
                        {cat === 'Resources' && 'Free checklists, guidebooks, and PDF releases.'}
                        {cat === 'System' && 'Critical platform announcements and maintenance info.'}
                        {cat === 'Security' && 'Login alerts, credential resets, and account updates.'}
                      </span>
                    </td>
                    
                    {/* In-App Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer justify-center">
                        <input 
                          type="checkbox" 
                          checked={preferences[cat].inApp}
                          onChange={() => handleToggle(cat, 'inApp')}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-650 peer-checked:after:bg-indigo-100"></div>
                      </label>
                    </td>

                    {/* Push Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer justify-center">
                        <input 
                          type="checkbox" 
                          checked={preferences[cat].push}
                          onChange={() => handleToggle(cat, 'push')}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600 peer-checked:after:bg-amber-100"></div>
                      </label>
                    </td>

                    {/* Email Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer justify-center">
                        <input 
                          type="checkbox" 
                          checked={preferences[cat].email}
                          onChange={() => handleToggle(cat, 'email')}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-emerald-100"></div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security / Quality statement */}
        <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-300 font-sans">Anti-Spam & Delivery Safeguards</h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              NeuraPulse complies with standard anti-spam guidelines. Email alerts are dispatched with clear unsubscribe links. In-App and Push updates respect local browser notification configurations.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-850 pt-4">
          {savedSuccess && (
            <span className="flex items-center space-x-1 px-3 py-1 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-lg animate-pulse">
              <Check className="w-3 h-3" />
              <span>Channels Updated Successfully!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl transition shadow-md hover:shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Channel matrix</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
