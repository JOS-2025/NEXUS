import React from 'react';
import { 
  Bell, 
  Search, 
  Check, 
  Trash2, 
  Archive, 
  Eye, 
  EyeOff, 
  Clock, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  ShieldAlert, 
  MessageSquare, 
  UserCheck, 
  BookOpen, 
  Gift, 
  Settings2 
} from 'lucide-react';

interface NotificationCenterProps {
  activeEmail: string;
  onClose: () => void;
  onArticleSelect?: (article: any) => void;
  onOpenSettings?: () => void;
}

export default function NotificationCenter({
  activeEmail,
  onClose,
  onArticleSelect,
  onOpenSettings
}: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  // Filters
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [activeStatus, setActiveStatus] = React.useState<string>('active'); // active, unread, archived
  const [searchQuery, setSearchQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  
  // Push Notification state
  const [pushStatus, setPushStatus] = React.useState<'default' | 'granted' | 'denied'>('default');

  // Load browser notification state on mount
  React.useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'Articles', label: 'Articles' },
    { id: 'AI News', label: 'AI News' },
    { id: 'Comments', label: 'Comments' },
    { id: 'Replies', label: 'Replies' },
    { id: 'Resources', label: 'Resources' },
    { id: 'System', label: 'System' },
    { id: 'Security', label: 'Security' }
  ];

  const fetchNotifications = React.useCallback(async (pageNum = 1, append = false) => {
    if (!activeEmail) return;
    try {
      setLoading(true);
      const url = `/api/notifications?email=${encodeURIComponent(activeEmail)}&category=${activeCategory}&status=${activeStatus}&q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=8`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setNotifications(prev => [...prev, ...data.list]);
        } else {
          setNotifications(data.list);
        }
        setTotalCount(data.total);
        setHasMore(data.list.length === 8 && (pageNum * 8) < data.total);
      }
      
      // Calculate unread count specifically
      const unreadUrl = `/api/notifications?email=${encodeURIComponent(activeEmail)}&status=unread`;
      const unreadRes = await fetch(unreadUrl);
      if (unreadRes.ok) {
        const unreadData = await unreadRes.json();
        setUnreadCount(unreadData.total);
      }
    } catch (e) {
      console.warn("Failed to load notifications gracefully:", e);
    } finally {
      setLoading(false);
    }
  }, [activeEmail, activeCategory, activeStatus, searchQuery]);

  // Refresh when filters change
  React.useEffect(() => {
    setPage(1);
    fetchNotifications(1, false);
  }, [fetchNotifications, activeCategory, activeStatus, searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleMarkRead = async (id?: string, currentIsRead = false) => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, id, unread: currentIsRead })
      });
      if (res.ok) {
        // Optimistic UI updates
        if (id) {
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isRead: !currentIsRead } : n)
          );
          setUnreadCount(prev => currentIsRead ? prev + 1 : Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        }
      }
    } catch (e) {
      console.error("Failed to update read state", e);
    }
  };

  const handleDelete = async (id: string, action: 'archive' | 'delete') => {
    try {
      const res = await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, id, action })
      });
      if (res.ok) {
        const removed = notifications.find(n => n.id === id);
        if (removed && !removed.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support browser push notifications.");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      
      if (permission === 'granted') {
        // Register simulation endpoint
        const sub = {
          endpoint: `https://fcm.googleapis.com/fcm/send/simulated-token-${Math.random().toString(36).substr(2, 9)}`,
          keys: {
            p256dh: btoa(Math.random().toString()),
            auth: btoa(Math.random().toString())
          }
        };

        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: activeEmail,
            subscription: sub,
            deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
            browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 'safari'
          })
        });

        if (res.ok) {
          alert("Success! Browser Push notifications are now configured for NeuraPulse.");
        }
      }
    } catch (e) {
      console.error("Failed to request push credentials", e);
    }
  };

  // Helper to get Category Icon
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'System':
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
      case 'Security':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'Comments':
      case 'Replies':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'Articles':
      case 'AI News':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'Resources':
        return <Gift className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  // Handle deep link click
  const handleNotificationClick = async (notif: any) => {
    // 1. Mark as read
    if (!notif.isRead) {
      await handleMarkRead(notif.id, false);
    }
    
    // 2. Track click event in backend
    try {
      await fetch(`/api/notifications/track?type=click&email=${encodeURIComponent(activeEmail)}&notificationId=${notif.id}`);
    } catch (e) {
      console.error("Click tracking failed", e);
    }

    // 3. Navigate if deepLink matches an article selection
    if (notif.deepLink) {
      const match = notif.deepLink.match(/article=(art-\d+)/);
      if (match && onArticleSelect) {
        onArticleSelect({ id: match[1] });
      }
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Bell className="w-5 h-5 text-indigo-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wide">NOTIFICATION HUB</h3>
            <p className="text-[10px] text-slate-400 font-mono">Real-Time Audience Delivery</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button 
              onClick={() => handleMarkRead()}
              className="text-[10px] font-mono font-bold text-indigo-300 hover:text-indigo-200 hover:bg-white/10 px-2 py-1 rounded transition"
            >
              Mark All Read
            </button>
          )}
          {onOpenSettings && (
            <button 
              onClick={() => { onOpenSettings(); onClose(); }}
              className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition"
              title="Preferences"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Browser Push Permission CTA Banner */}
      {pushStatus !== 'granted' && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-indigo-950 font-sans">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 animate-pulse" />
            <span>Enable <strong>Browser Push Notifications</strong> for instant breaking AI news?</span>
          </div>
          <button
            onClick={handleRequestPushPermission}
            className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition font-mono"
          >
            Allow
          </button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-col gap-2">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs py-2 pl-8 pr-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
        </div>

        {/* Status toggles */}
        <div className="flex space-x-1.5 text-[10px] font-mono">
          <button
            onClick={() => setActiveStatus('active')}
            className={`px-2.5 py-1 rounded-full border transition ${
              activeStatus === 'active' 
                ? 'bg-slate-800 border-slate-850 text-white font-bold' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            ACTIVE
          </button>
          <button
            onClick={() => setActiveStatus('unread')}
            className={`px-2.5 py-1 rounded-full border transition ${
              activeStatus === 'unread' 
                ? 'bg-slate-800 border-slate-850 text-white font-bold' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            UNREAD ({unreadCount})
          </button>
          <button
            onClick={() => setActiveStatus('archived')}
            className={`px-2.5 py-1 rounded-full border transition ${
              activeStatus === 'archived' 
                ? 'bg-slate-800 border-slate-850 text-white font-bold' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            ARCHIVED
          </button>
        </div>
      </div>

      {/* Horizontal Category Tab list */}
      <div className="flex border-b border-slate-100 bg-white overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
              activeCategory === cat.id 
                ? 'border-indigo-600 text-indigo-600 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Notification feed */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-2">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs font-mono">Syncing Notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
            <Bell className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
            <span className="text-xs font-semibold text-slate-800">All caught up!</span>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
              No notifications matching your filters. When new events trigger, they will stream right here.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                id={`notif-item-${notif.id}`}
                className={`p-3 bg-white border rounded-xl flex items-start gap-2.5 shadow-sm transition-all relative ${
                  !notif.isRead ? 'border-indigo-100 ring-1 ring-indigo-50/50 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Category Icon */}
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${!notif.isRead ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Body Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold font-mono text-indigo-600 uppercase tracking-wider">{notif.category}</span>
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className={`text-xs mt-0.5 text-slate-900 leading-tight ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                    {notif.body}
                  </p>
                </div>

                {/* Inline Action Triggers */}
                <div className="flex flex-col space-y-1 justify-center">
                  <button
                    onClick={() => handleMarkRead(notif.id, notif.isRead)}
                    className={`p-1 rounded transition hover:bg-slate-100 ${notif.isRead ? 'text-slate-400 hover:text-indigo-600' : 'text-indigo-600 hover:text-slate-400'}`}
                    title={notif.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {notif.isRead ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {notif.isArchived ? (
                    <button
                      onClick={() => handleDelete(notif.id, 'delete')}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(notif.id, 'archive')}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                      title="Archive Notification"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Pagination */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="w-full py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-indigo-600" /> : 'Load More Alerts'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
