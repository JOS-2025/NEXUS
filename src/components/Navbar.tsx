import React from 'react';
import { Newspaper, ShieldAlert, Cpu, Sparkles, FolderDown, LayoutDashboard, UserCheck, Menu, X, User, Bell, Check, Rss, LogIn, LogOut, ChevronDown, Award } from 'lucide-react';
import { getWebsiteSettings } from '../lib/settings';
import NotificationCenter from './NotificationCenter';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: 'anonymous' | 'registered' | 'author' | 'editor' | 'admin';
  setUserRole: (role: any) => void;
  onClearFilters: () => void;
  onArticleSelect?: (article: any) => void;
  articles?: any[];
  activeEmail: string;
  userProfile?: any;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  userRole, 
  setUserRole, 
  onClearFilters,
  onArticleSelect,
  articles,
  activeEmail,
  userProfile,
  onOpenAuth,
  onSignOut
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState(getWebsiteSettings());

  // Notifications and Subscriptions State
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notificationTab, setNotificationTab] = React.useState<'inbox' | 'subscribe'>('inbox');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Profile Dropdown State and Ref
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  const [followedAuthors, setFollowedAuthors] = React.useState<string[]>(() => {
    const saved = localStorage.getItem(`followed_authors_${activeEmail}`);
    return saved ? JSON.parse(saved) : ["Sarah Chen"];
  });

  const [lastReadTime, setLastReadTime] = React.useState<number>(() => {
    const saved = localStorage.getItem(`last_read_notifications_${activeEmail}`);
    return saved ? parseInt(saved, 10) : Date.now() - 3 * 24 * 60 * 60 * 1000;
  });

  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (!activeEmail) {
      setUnreadCount(0);
      return;
    }
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`/api/notifications?email=${encodeURIComponent(activeEmail)}&status=unread`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.total);
        }
      } catch (e) {
        console.warn("Failed fetching unread notification count gracefully:", e);
      }
    };
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    window.addEventListener('nexus_notifications_refreshed', fetchUnreadCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('nexus_notifications_refreshed', fetchUnreadCount);
    };
  }, [activeEmail]);

  React.useEffect(() => {
    const saved = localStorage.getItem(`followed_authors_${activeEmail}`);
    setFollowedAuthors(saved ? JSON.parse(saved) : ["Sarah Chen"]);
    
    const savedTime = localStorage.getItem(`last_read_notifications_${activeEmail}`);
    setLastReadTime(savedTime ? parseInt(savedTime, 10) : Date.now() - 3 * 24 * 60 * 60 * 1000);
  }, [activeEmail]);

  React.useEffect(() => {
    const syncFollowedAuthors = () => {
      const saved = localStorage.getItem(`followed_authors_${activeEmail}`);
      if (saved) {
        setFollowedAuthors(JSON.parse(saved));
      }
    };
    window.addEventListener('nexus_followed_authors_changed', syncFollowedAuthors);
    return () => window.removeEventListener('nexus_followed_authors_changed', syncFollowedAuthors);
  }, [activeEmail]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleFollow = (authorName: string) => {
    let updated: string[];
    if (followedAuthors.includes(authorName)) {
      updated = followedAuthors.filter(a => a !== authorName);
    } else {
      updated = [...followedAuthors, authorName];
    }
    setFollowedAuthors(updated);
    localStorage.setItem(`followed_authors_${activeEmail}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('nexus_followed_authors_changed'));
  };

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      const now = Date.now();
      setLastReadTime(now);
      localStorage.setItem(`last_read_notifications_${activeEmail}`, now.toString());
    }
  };

  const allAuthors = React.useMemo(() => {
    const preset = ["Sarah Chen", "Marcus Vance", "Elena Rostova", "Site Editor"];
    if (!articles) return preset;
    const fromArticles = articles.map(a => a.authorName).filter(Boolean);
    const unique = Array.from(new Set([...preset, ...fromArticles]));
    return unique;
  }, [articles]);

  const notifications = React.useMemo(() => {
    if (!articles) return [];
    return articles
      .filter(art => art.status === 'published' && followedAuthors.includes(art.authorName))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [articles, followedAuthors]);

  React.useEffect(() => {
    const updateSettings = () => {
      setSettings(getWebsiteSettings());
    };
    window.addEventListener('nexus_settings_changed', updateSettings);
    return () => window.removeEventListener('nexus_settings_changed', updateSettings);
  }, []);

  const roles = React.useMemo(() => {
    const list = [
      { value: 'anonymous', label: 'Anonymous Visitor' },
      { value: 'registered', label: 'Registered Reader' },
      { value: 'author', label: 'Author' },
      { value: 'editor', label: 'Editor' },
    ];
    if (activeEmail.toLowerCase().trim() === 'josphatmuchemi976@gmail.com') {
      list.push({ value: 'admin', label: 'Administrator' });
    }
    return list;
  }, [activeEmail]);

  const handleTabChange = (tab: string) => {
    if (tab === 'home') {
      onClearFilters();
    }
    setCurrentTab(tab);
    setIsOpen(false);
  };

  return (
    <header id="nav-header" className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleTabChange('home')}>
            <img 
              src="/src/assets/images/app_favicon_1784831327118.jpg" 
              alt="Nexus Logo" 
              className="w-9 h-9 rounded-xl object-cover shadow-md shadow-indigo-200 border border-slate-900"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-left">
              <span className="font-sans font-bold text-xl tracking-tight text-gray-900 leading-none uppercase">{settings.siteName}</span>
              <span className="font-mono text-[9px] text-indigo-600 font-bold tracking-widest uppercase">{settings.siteTagline}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleTabChange('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => handleTabChange('tools')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                currentTab === 'tools' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Tools</span>
            </button>
            <button
              onClick={() => handleTabChange('resources')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                currentTab === 'resources' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <FolderDown className="w-4 h-4" />
              <span>Library</span>
            </button>
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                currentTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Dashboard</span>
            </button>
            <button
              onClick={() => handleTabChange('cms')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                currentTab === 'cms' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Creator Studio</span>
            </button>
            <button
              onClick={() => handleTabChange('analytics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                currentTab === 'analytics' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{userRole === 'admin' ? 'Ops Center' : 'Analytics'}</span>
            </button>
            <button
              onClick={() => handleTabChange('about')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'about' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right Role Selector Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Bell Icon & Dropdown container */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="header-notifications-bell"
                onClick={handleOpenNotifications}
                className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                title="Article Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {/* Dropdown menu */}
              {isNotificationsOpen && (
                <div 
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2.5 w-96 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <NotificationCenter 
                    activeEmail={activeEmail} 
                    onClose={() => setIsNotificationsOpen(false)} 
                    onArticleSelect={onArticleSelect}
                    onOpenSettings={() => setCurrentTab('settings')}
                  />
                </div>
              )}
            </div>

            {userProfile ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-100 hover:border-indigo-100 rounded-full transition-all cursor-pointer focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                    {userProfile.displayName ? userProfile.displayName.charAt(0) : userProfile.email.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left max-w-[120px]">
                    <span className="font-sans font-semibold text-xs text-slate-800 truncate leading-none">
                      {userProfile.displayName || 'Reader'}
                    </span>
                    <span className="font-mono text-[8px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5 leading-none">
                      {userRole}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-2 text-left space-y-1">
                    <div className="px-3 py-2 border-b border-slate-50">
                      <span className="block text-xs font-bold text-slate-800 truncate">{userProfile.displayName || 'User Profile'}</span>
                      <span className="block text-[10px] text-slate-400 truncate mt-0.5">{userProfile.email}</span>
                    </div>
                    
                    {/* Simulated Workspace Switcher inside profile dropdown */}
                    <div className="px-3 py-1.5">
                      <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Simulate Workspace:</span>
                      <select
                        value={userRole}
                        onChange={(e) => {
                          setUserRole(e.target.value as any);
                          setIsProfileOpen(false);
                        }}
                        className="w-full bg-slate-50 border border-slate-150 rounded-lg text-[10px] font-bold text-slate-600 py-1 px-1.5 focus:outline-none focus:ring-0 cursor-pointer"
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 shadow-inner">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="bg-transparent border-none text-[10px] font-bold text-slate-600 focus:outline-none cursor-pointer pr-1 leading-none"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.value.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-100 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Bell Icon & Dropdown container on Mobile */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="mobile-notifications-bell"
                onClick={handleOpenNotifications}
                className="relative p-1.5 text-gray-450 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition-all focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
                )}
              </button>

              {/* Dropdown menu on Mobile */}
              {isNotificationsOpen && (
                <div 
                  id="mobile-notifications-dropdown-menu"
                  className="absolute right-[-60px] mt-2.5 w-80 sm:w-96 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <NotificationCenter 
                    activeEmail={activeEmail} 
                    onClose={() => setIsNotificationsOpen(false)} 
                    onArticleSelect={onArticleSelect}
                    onOpenSettings={() => setCurrentTab('settings')}
                  />
                </div>
              )}
            </div>

            {userProfile ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                {userProfile.displayName ? userProfile.displayName.charAt(0) : userProfile.email.charAt(0)}
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-gray-50 border border-gray-100 rounded-full px-2 py-1">
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="bg-transparent border-none text-[10px] font-semibold text-gray-700 focus:outline-none pr-1"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.value.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleTabChange('home')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => handleTabChange('tools')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'tools' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            AI Tools Directory
          </button>
          <button
            onClick={() => handleTabChange('resources')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'resources' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            Resource Library
          </button>
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            My Dashboard
          </button>
          <button
            onClick={() => handleTabChange('cms')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'cms' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            Creator Studio
          </button>
          <button
            onClick={() => handleTabChange('analytics')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'analytics' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            {userRole === 'admin' ? 'Ops Center' : 'Analytics Board'}
          </button>
          <button
            onClick={() => handleTabChange('about')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium block ${
              currentTab === 'about' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'
            }`}
          >
            About & Contact
          </button>

          <div className="pt-4 pb-2 border-t border-slate-100 mt-4">
            {userProfile ? (
              <div className="space-y-3 px-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                    {userProfile.displayName ? userProfile.displayName.charAt(0) : userProfile.email.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block font-sans font-bold text-sm text-slate-900 truncate">
                      {userProfile.displayName || 'Reader'}
                    </span>
                    <span className="block font-mono text-[10px] text-slate-400 truncate">
                      {userProfile.email}
                    </span>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[8px] font-bold uppercase tracking-wider rounded-md">
                      {userRole}
                    </span>
                  </div>
                </div>

                {/* Mobile simulated role select */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider">Simulated Role:</span>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold text-slate-600 py-2 px-3 focus:outline-none focus:ring-0 cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onSignOut?.();
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              </div>
            ) : (
              <div className="px-3 space-y-2">
                <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Operational Identity</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth?.();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
