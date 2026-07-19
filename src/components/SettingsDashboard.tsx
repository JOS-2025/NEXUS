import React from 'react';
import { 
  Settings, 
  Shield, 
  Sparkles, 
  DollarSign, 
  Globe, 
  Mail, 
  Phone, 
  Check, 
  RotateCcw, 
  FileText, 
  User, 
  HelpCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getWebsiteSettings, saveWebsiteSettings, DEFAULT_SETTINGS, WebsiteSettings } from '../lib/settings';
import NotificationSettingsPanel from './NotificationSettingsPanel';

interface SettingsDashboardProps {
  activeEmail?: string;
}

export default function SettingsDashboard({ activeEmail = 'josphatmuchemi976@gmail.com' }: SettingsDashboardProps) {
  const [settings, setSettings] = React.useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = React.useState(false);
  const [activeSubTab, setActiveSubTab] = React.useState<'general' | 'legal' | 'ai' | 'monetization' | 'seo' | 'notifications'>('general');
  const [isValidatingPaypal, setIsValidatingPaypal] = React.useState(false);

  const [resetConfirm, setResetConfirm] = React.useState(false);

  React.useEffect(() => {
    // Load initial settings from localStorage
    setSettings(getWebsiteSettings());
  }, []);

  const handleValidatePaypal = async () => {
    if (!settings.paypalClientId || !settings.paypalClientSecret) {
      alert("Please fill in both PayPal Client ID and Client Secret first.");
      return;
    }
    setIsValidatingPaypal(true);
    try {
      const res = await fetch('/api/paypal/validate-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: settings.paypalClientId,
          clientSecret: settings.paypalClientSecret,
          environment: settings.paypalEnvironment || 'sandbox'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'PayPal validation failed.');
      }
      alert(data.message || "PayPal Merchant API status checked: Integration Live & Authenticated successfully.");
    } catch (err: any) {
      alert(err.message || 'Error validating PayPal credentials.');
    } finally {
      setIsValidatingPaypal(false);
    }
  };

  const handleInputChange = (field: keyof WebsiteSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebsiteSettings(settings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 5000);
      return;
    }
    setSettings(DEFAULT_SETTINGS);
    saveWebsiteSettings(DEFAULT_SETTINGS);
    setIsSaved(true);
    setResetConfirm(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1 text-left">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="font-sans font-black text-2xl text-white tracking-tight">
              Central Settings Console
            </h1>
          </div>
          <p className="font-sans text-xs text-slate-400 leading-relaxed">
            Manage global platform configurations, legal & compliance registries, AI models, and SEO indexes.
          </p>
        </div>

        {/* Saved Toast / Banner indicator */}
        <div className="flex items-center space-x-3">
          {isSaved && (
            <span className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 font-sans text-xs font-bold rounded-xl animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Settings Saved Successfully!</span>
            </span>
          )}
          <button
            onClick={handleReset}
            className={`flex items-center space-x-1.5 font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition-all ${
              resetConfirm 
                ? 'bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40' 
                : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetConfirm ? 'animate-spin' : ''}`} />
            <span>{resetConfirm ? 'Click to Confirm Reset' : 'Reset Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar Sub-tabs */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'general', label: 'General Identity', icon: Settings, desc: 'Site branding & contacts' },
            { id: 'legal', label: 'Legal & Compliance Desk', icon: Shield, desc: 'Terms, policies, disclosures' },
            { id: 'ai', label: 'AI Operations & Automation', icon: Sparkles, desc: 'Model configs & toggles' },
            { id: 'monetization', label: 'Monetization & Paywall', icon: DollarSign, desc: 'Subscription rates & disclosures' },
            { id: 'seo', label: 'SEO & Site Analytics', icon: Globe, desc: 'Tracking & metadata indexes' },
            { id: 'notifications', label: 'Engagement Channels', icon: Mail, desc: 'Email, Push & In-App Alerts' }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                  active 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <span className="font-sans font-bold text-xs block leading-tight">{tab.label}</span>
                  <span className={`text-[10px] leading-tight ${active ? 'text-indigo-200' : 'text-slate-500'}`}>{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Input Panel Fields */}
        <div className="lg:col-span-9 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-left">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeSubTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-1.5">
                    <Settings className="w-4 h-4 text-indigo-400" />
                    <span>General Website Branding</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure public site credentials, name, and general communications.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Website Name</label>
                    <input 
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Site Tagline</label>
                    <input 
                      type="text"
                      value={settings.siteTagline}
                      onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold">Global Site Description / Mission statement</label>
                    <textarea 
                      rows={3}
                      value={settings.siteDescription}
                      onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Primary Contact Email</span>
                    </label>
                    <input 
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Support Hotline Phone</span>
                    </label>
                    <input 
                      type="text"
                      value={settings.supportPhone}
                      onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'legal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Legal & Compliance Desk Registries</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure parameters for the legal & compliance desk, privacy terms, and consumer disclosures.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Legal Compliance Email</span>
                    </label>
                    <input 
                      type="email"
                      value={settings.legalEmail}
                      onChange={(e) => handleInputChange('legalEmail', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Compliance Hotline Phone</span>
                    </label>
                    <input 
                      type="text"
                      value={settings.legalPhone}
                      onChange={(e) => handleInputChange('legalPhone', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Active Terms Revision Date</span>
                    </label>
                    <input 
                      type="text"
                      value={settings.activeTermsRevision}
                      onChange={(e) => handleInputChange('activeTermsRevision', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">GDPR Banner Notice</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.allowGdprBanner}
                          onChange={(e) => handleInputChange('allowGdprBanner', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                        <span className="ml-3 text-slate-300 font-medium">Enable Cookies & Consent Popups</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Legal Compliance Disclosure Banner Text</span>
                    </label>
                    <textarea 
                      rows={3}
                      value={settings.complianceDisclosure}
                      onChange={(e) => handleInputChange('complianceDisclosure', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block italic leading-normal">
                      This text appears in dynamic disclosures, legal policy pages, and footers throughout the platform.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Terms of Service Absolute URL</label>
                    <input 
                      type="url"
                      value={settings.termsUrl}
                      onChange={(e) => handleInputChange('termsUrl', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Privacy Policy Absolute URL</label>
                    <input 
                      type="url"
                      value={settings.privacyUrl}
                      onChange={(e) => handleInputChange('privacyUrl', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Suite & LLM Operations Engine</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Tune target reasoning configurations, models, and background automation loops.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Target reasoning LLM model</label>
                    <select 
                      value={settings.selectedGeminiModel}
                      onChange={(e) => handleInputChange('selectedGeminiModel', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default - High Speed & Balanced)</option>
                      <option value="gemini-3.5-pro">Gemini 3.5 Pro (Deep Logical Reasoner)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Context Window)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-Low Latency)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Default System Author</span>
                    </label>
                    <input 
                      type="text"
                      value={settings.defaultAuthorName}
                      onChange={(e) => handleInputChange('defaultAuthorName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold">Default Author Avatar Image URL</label>
                    <input 
                      type="text"
                      value={settings.defaultAuthorAvatar}
                      onChange={(e) => handleInputChange('defaultAuthorAvatar', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Image Alt tags automation</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.enableAutoSeoTags}
                          onChange={(e) => handleInputChange('enableAutoSeoTags', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                        <span className="ml-3 text-slate-300 font-medium">Auto-Generate Alt Text via Multimodal Gemini</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Automatic Review Pipeline</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.enableAutoEditorialReview}
                          onChange={(e) => handleInputChange('enableAutoEditorialReview', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                        <span className="ml-3 text-slate-300 font-medium">Trigger AI Audit instantly on draft submits</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'monetization' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-indigo-400" />
                    <span>Monetization & Paywall Architectures</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure premium content price limits, subscription rates, and affiliate rules.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Premium Membership price (Monthly)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={settings.premiumMonthlyPrice}
                        onChange={(e) => handleInputChange('premiumMonthlyPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Affiliate Disclosure Statement</label>
                    <div className="flex items-center h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.enableAffiliateDisclosure}
                          onChange={(e) => handleInputChange('enableAffiliateDisclosure', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                        <span className="ml-3 text-slate-300 font-medium">Require Affiliate commission tags disclosure</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold">Stripe Public API Key</label>
                    <input 
                      type="text"
                      value={settings.stripePublicKey}
                      onChange={(e) => handleInputChange('stripePublicKey', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500 block italic leading-normal">
                      Used for standard frontend Stripe.js payment token creation. Never expose secret keys!
                    </span>
                  </div>

                  {/* PayPal Integration Fields */}
                  <div className="border-t border-slate-800/80 pt-4 md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-200">PayPal Merchant & Subscription Integration</h4>
                        <p className="text-[10px] text-slate-500">Allow users to pay with PayPal and receive recurring monetization payouts directly.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.enablePayPal ?? true}
                          onChange={(e) => handleInputChange('enablePayPal', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      </label>
                    </div>

                    {(settings.enablePayPal ?? true) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                          <label className="text-slate-400 font-bold">PayPal Client ID</label>
                          <input 
                            type="text"
                            value={settings.paypalClientId ?? ''}
                            onChange={(e) => handleInputChange('paypalClientId', e.target.value)}
                            placeholder="e.g. AX_paypal_client_id_..."
                            className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-750 font-mono focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-400 font-bold">PayPal Client Secret</label>
                          <input 
                            type="password"
                            value={settings.paypalClientSecret ?? ''}
                            onChange={(e) => handleInputChange('paypalClientSecret', e.target.value)}
                            placeholder="••••••••••••••••••••••••••••••••"
                            className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-750 font-mono focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-400 font-bold">PayPal Execution Environment</label>
                          <select
                            value={settings.paypalEnvironment ?? 'sandbox'}
                            onChange={(e) => handleInputChange('paypalEnvironment', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none"
                          >
                            <option value="sandbox">Sandbox (Testing / Mock)</option>
                            <option value="live">Live (Real Payouts)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 flex items-end">
                          <button
                            type="button"
                            onClick={handleValidatePaypal}
                            disabled={isValidatingPaypal}
                            className="w-full h-10 flex items-center justify-center space-x-1.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-[11px] transition-colors border border-slate-700 disabled:opacity-50"
                          >
                            {isValidatingPaypal ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Validating Credentials...</span>
                              </>
                            ) : (
                              <span>Validate PayPal API Credentials</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'seo' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>SEO Channels & Tracking Analytics</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure global metadata tags, search engine indexing and site tracking analytics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold">Google Analytics measurement ID</label>
                    <input 
                      type="text"
                      value={settings.analyticsId}
                      onChange={(e) => handleInputChange('analyticsId', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-slate-400 font-bold">Platform Meta keywords (Comma separated)</label>
                    <textarea 
                      rows={3}
                      value={settings.targetKeywords}
                      onChange={(e) => handleInputChange('targetKeywords', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-500 block italic leading-normal">
                      Appended into the main index HTML header template dynamically for indexing bots.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'notifications' && (
              <NotificationSettingsPanel activeEmail={activeEmail} />
            )}

            {/* Bottom Button Row */}
            {activeSubTab !== 'notifications' && (
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-sans text-xs font-bold py-3 px-6 rounded-2xl shadow-xl transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Platform Configurations</span>
                </button>
              </div>
            )}

          </form>
        </div>

      </div>

    </div>
  );
}
