import React from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'hero' | 'footer' | 'standard';
}

export default function NewsletterSubscription({ variant = 'standard' }: NewsletterSubscriptionProps) {
  const [email, setEmail] = React.useState('');
  const [preferences, setPreferences] = React.useState<string[]>(['ai', 'productivity']);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const options = [
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'productivity', label: 'Productivity & Automation' },
    { value: 'entrepreneurship', label: 'Tech Entrepreneurship' },
  ];

  const handleTogglePreference = (val: string) => {
    if (preferences.includes(val)) {
      setPreferences(preferences.filter(p => p !== val));
    } else {
      setPreferences([...preferences, val]);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Rendering for Footer Variant
  if (variant === 'footer') {
    return (
      <div id="newsletter-subscription-footer" className="space-y-3">
        <h4 className="font-mono text-[10px] font-bold uppercase text-white tracking-widest flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Intelligence Feed</span>
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Elite frameworks and AI insights delivered directly.
        </p>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subscribed!</span>
            </div>
            <p className="text-slate-400 text-[10px]">You are now on the intelligence list.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 p-1 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                title="Subscribe"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-[10px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-1 pt-1">
              {options.map((opt) => {
                const active = preferences.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTogglePreference(opt.value)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-tight border transition-all ${
                      active
                        ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {opt.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </form>
        )}
      </div>
    );
  }

  // Rendering for Hero / Prominent Variant
  const isHero = variant === 'hero';

  return (
    <div 
      id={`newsletter-subscription-${variant}`} 
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-xl border ${
        isHero 
          ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border-slate-800' 
          : 'bg-white text-gray-800 border-gray-100 shadow-gray-100/50'
      }`}
    >
      {/* Background accents */}
      {isHero && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-28 -mt-28"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        </>
      )}

      <div className="relative max-w-xl mx-auto text-center space-y-4">
        <div className={`inline-flex p-3 rounded-2xl mx-auto border ${
          isHero 
            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
            : 'bg-indigo-50 border-indigo-100 text-indigo-600'
        }`}>
          <Mail className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h3 className={`font-sans font-black tracking-tight text-xl sm:text-2xl leading-tight ${
            isHero ? 'text-white' : 'text-gray-900'
          }`}>
            Join the Nexus Intelligence Digest
          </h3>
          <p className={`text-xs max-w-md mx-auto leading-relaxed ${
            isHero ? 'text-slate-300' : 'text-gray-500'
          }`}>
            High-leverage development frameworks, technical blueprints, and curated AI ecosystem analyses delivered straight to your operations.
          </p>
        </div>

        {success ? (
          <div className={`border rounded-2xl p-6 max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-200 ${
            isHero 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-800'
          }`}>
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
            <h4 className="font-bold text-xs uppercase tracking-wide">Subscription Verified!</h4>
            <p className="text-[11px] mt-1 text-slate-400 leading-normal">
              Your preferences have been synchronized in our registry. Get ready for premium digests.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-3 text-[10px] font-bold text-indigo-500 hover:underline underline-offset-2"
            >
              Sign up another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4 max-w-md mx-auto">
            
            {/* Preferred tags */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {options.map((opt) => {
                const active = preferences.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTogglePreference(opt.value)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      active
                        ? isHero
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : isHero
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                          : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Form Inputs */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your professional email"
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all border ${
                  isHero
                    ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400'
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-450'
                }`}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 shrink-0 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing up...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-rose-700 text-[11px] justify-center">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
