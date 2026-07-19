import React from 'react';
import { Cpu } from 'lucide-react';
import { getWebsiteSettings } from '../lib/settings';
import NewsletterSubscription from './NewsletterSubscription';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ onSelectCategory, setCurrentTab }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = React.useState(getWebsiteSettings());

  React.useEffect(() => {
    const updateSettings = () => {
      setSettings(getWebsiteSettings());
    };
    window.addEventListener('nexus_settings_changed', updateSettings);
    return () => window.removeEventListener('nexus_settings_changed', updateSettings);
  }, []);

  const handleCatClick = (cat: string) => {
    onSelectCategory(cat);
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="nexus-footer-block" className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8 mt-20 text-left text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Brand section */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-sans font-black text-lg text-white tracking-tight leading-none uppercase">{settings.siteName}</span>
          </div>
          <p className="font-sans text-slate-400 leading-relaxed text-[11px] max-w-sm">
            {settings.siteDescription}
          </p>
        </div>

        {/* Categories Section */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-mono text-[10px] font-bold uppercase text-white tracking-widest">Topic Channels</h4>
          <ul className="space-y-2 text-[11px]">
            {['Artificial Intelligence', 'Productivity', 'Entrepreneurship', 'Technology'].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => handleCatClick(cat)}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-slate-400 text-left focus:outline-none"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources Section */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-mono text-[10px] font-bold uppercase text-white tracking-widest">Platform Vault</h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button onClick={() => setCurrentTab('tools')} className="hover:text-indigo-400 transition-colors text-slate-400 text-left focus:outline-none">
                AI Tools Directory
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('resources')} className="hover:text-indigo-400 transition-colors text-slate-400 text-left focus:outline-none">
                Downloadable Blueprints
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('cms')} className="hover:text-indigo-400 transition-colors text-slate-400 text-left focus:outline-none">
                CMS Content Studio
              </button>
            </li>
          </ul>
        </div>

        {/* Legal Disclaimers */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-mono text-[10px] font-bold uppercase text-white tracking-widest">Regulatory</h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button
                onClick={() => { setCurrentTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-indigo-400 transition-colors cursor-pointer text-slate-400 text-left focus:outline-none"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentTab('cookie-preferences'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-indigo-400 transition-colors cursor-pointer text-slate-400 text-left focus:outline-none"
              >
                Cookie Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentTab('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-indigo-400 transition-colors cursor-pointer text-slate-400 text-left focus:outline-none"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentTab('cookie-preferences'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-indigo-400 transition-colors cursor-pointer text-slate-400 text-left focus:outline-none"
                title="Manage granular cookies consent"
              >
                Manage Cookie Preferences
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription column */}
        <div className="md:col-span-3">
          <NewsletterSubscription variant="footer" />
        </div>
      </div>

      {/* Copy row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <span>© {currentYear} {settings.siteName} Digital Media Inc. All rights reserved.</span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
          Crafted Securely by Josphat Muchemi
        </span>
      </div>
    </footer>
  );
}
