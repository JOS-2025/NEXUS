import React from 'react';
import { 
  User, Mail, Flame, BookOpen, Bookmark, Award, Clock, ArrowRight, 
  CheckCircle, Trash2, Plus, Heart, TrendingUp, UserCheck, Sparkles, 
  Edit, Save, CheckSquare, ListPlus, ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { Article, ReaderProfile, KnowledgeHubGuide } from '../types';

interface ReaderDashboardProps {
  userRole: 'anonymous' | 'registered' | 'author' | 'editor' | 'admin';
  activeEmail: string;
  setActiveEmail: (email: string) => void;
  articles: Article[];
  onReadArticle: (art: Article) => void;
  onRefreshArticles: () => void;
}

export default function ReaderDashboard({
  userRole,
  activeEmail,
  setActiveEmail,
  articles,
  onReadArticle,
  onRefreshArticles
}: ReaderDashboardProps) {
  const [profile, setProfile] = React.useState<ReaderProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // PayPal Integration States
  const [showPaypalModal, setShowPaypalModal] = React.useState(false);
  const [paypalEmailInput, setPaypalEmailInput] = React.useState(activeEmail);
  const [paypalPasswordInput, setPaypalPasswordInput] = React.useState('');
  const [paypalProcessing, setPaypalProcessing] = React.useState(false);

  // Editable fields
  const [displayName, setDisplayName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [goalMinutes, setGoalMinutes] = React.useState(15);
  const [preferredCategories, setPreferredCategories] = React.useState<string[]>([]);
  const [emailInput, setEmailInput] = React.useState(activeEmail);

  // Authors followed (stored locally in localStorage to simulate following authors)
  const [followedAuthors, setFollowedAuthors] = React.useState<string[]>(() => {
    const saved = localStorage.getItem(`followed_authors_${activeEmail}`);
    return saved ? JSON.parse(saved) : ["Sarah Chen"];
  });

  // Knowledge base guides
  const [guides, setGuides] = React.useState<KnowledgeHubGuide[]>([]);

  const availableCategories = [
    'Artificial Intelligence',
    'Productivity',
    'Entrepreneurship',
    'Technology'
  ];

  const authorsToFollow = [
    { name: "Sarah Chen", role: "Principal AI Research Scientist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { name: "Marcus Vance", role: "Serial Tech Bootstrapper & Investor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
    { name: "Elena Rostova", role: "Head of Productivity Engineering", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" },
    { name: "Site Editor", role: "Managing Editor & Publisher", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" }
  ];

  // Fetch reader profile
  const fetchProfile = async (emailToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reader/profile?email=${encodeURIComponent(emailToFetch)}`);
      if (!res.ok) throw new Error('Could not pull your reader profile from the server.');
      const data = await res.json();
      setProfile(data);
      setDisplayName(data.displayName || data.email.split('@')[0]);
      setBio(data.bio || '');
      setGoalMinutes(data.readingGoalMinutesPerDay || 15);
      setPreferredCategories(data.preferredCategories || ['Artificial Intelligence']);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching user dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch knowledge guides
  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/guides');
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (err) {
      console.error('Error fetching guides:', err);
    }
  };

  React.useEffect(() => {
    fetchProfile(activeEmail);
    fetchGuides();
  }, [activeEmail]);

  React.useEffect(() => {
    localStorage.setItem(`followed_authors_${activeEmail}`, JSON.stringify(followedAuthors));
  }, [followedAuthors, activeEmail]);

  React.useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem(`followed_authors_${activeEmail}`);
      if (saved) {
        setFollowedAuthors(JSON.parse(saved));
      }
    };
    window.addEventListener('nexus_followed_authors_changed', handleSync);
    return () => window.removeEventListener('nexus_followed_authors_changed', handleSync);
  }, [activeEmail]);

  // Handle email switch
  const handleSwitchEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setActiveEmail(emailInput);
  };

  // Save profile settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/reader/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeEmail,
          displayName,
          bio,
          readingGoalMinutesPerDay: goalMinutes,
          preferredCategories,
          bookmarks: profile?.bookmarks || [],
          readingHistory: profile?.readingHistory || [],
          streakCount: profile?.streakCount || 0,
          lastActiveDate: profile?.lastActiveDate || ''
        })
      });
      if (!res.ok) throw new Error('Could not save profile settings.');
      const updated = await res.json();
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // Bookmark toggle from dashboard
  const handleRemoveBookmark = async (articleId: string) => {
    try {
      const res = await fetch('/api/reader/bookmark/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, articleId })
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        onRefreshArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PayPal checkout submit
  const handlePaypalUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalEmailInput || !paypalEmailInput.includes('@')) {
      alert('Please enter a valid PayPal email address.');
      return;
    }
    setPaypalProcessing(true);
    try {
      const generatedSubId = 'I-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const res = await fetch('/api/reader/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeEmail,
          isPremium: true,
          paypalEmail: paypalEmailInput,
          paypalSubscriptionId: generatedSubId
        })
      });
      if (!res.ok) throw new Error('Could not update subscription status on server.');
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setShowPaypalModal(false);
      alert(`PayPal Subscription Authorized Successfully!\nSubscription ID: ${generatedSubId}\nYou now have complete Premium access across Nexus.`);
    } catch (err: any) {
      alert(err.message || 'Error configuring PayPal subscription.');
    } finally {
      setPaypalProcessing(false);
    }
  };

  // Cancel PayPal subscription
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your PayPal Premium Membership subscription? You will lose access to premium blueprints and prompt assets.')) {
      return;
    }
    try {
      const res = await fetch('/api/reader/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeEmail,
          isPremium: false,
          paypalEmail: '',
          paypalSubscriptionId: ''
        })
      });
      if (!res.ok) throw new Error('Subscription cancellation failed on server.');
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      alert('Your PayPal Subscription has been canceled gracefully. Your account has returned to the standard Free Reader tier.');
    } catch (err: any) {
      alert(err.message || 'Error processing cancellation.');
    }
  };

  // Follow/Unfollow author
  const toggleFollowAuthor = (authorName: string) => {
    let updated: string[];
    if (followedAuthors.includes(authorName)) {
      updated = followedAuthors.filter(name => name !== authorName);
    } else {
      updated = [...followedAuthors, authorName];
    }
    setFollowedAuthors(updated);
    localStorage.setItem(`followed_authors_${activeEmail}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('nexus_followed_authors_changed'));
  };

  // Category preferences handler
  const handleCategoryCheckbox = (cat: string) => {
    if (preferredCategories.includes(cat)) {
      setPreferredCategories(prev => prev.filter(c => c !== cat));
    } else {
      setPreferredCategories(prev => [...prev, cat]);
    }
  };

  // Find bookmarked Article objects
  const bookmarkedArticles = articles.filter(art => 
    profile?.bookmarks?.includes(art.id)
  );

  // Find reading history details
  const historyArticles = (profile?.readingHistory || [])
    .map(hist => {
      const art = articles.find(a => a.id === hist.articleId);
      if (!art) return null;
      return {
        article: art,
        timestamp: hist.timestamp
      };
    })
    .filter((h): h is { article: Article; timestamp: string } => h !== null)
    .reverse() // show latest first
    .slice(0, 5); // limit to 5 items

  // Recommendations: articles in preferred categories that are NOT bookmarked
  const recommendedArticles = articles
    .filter(art => 
      art.status === 'published' &&
      preferredCategories.some(cat => art.category.toLowerCase() === cat.toLowerCase()) &&
      !profile?.bookmarks?.includes(art.id)
    )
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Dashboard Welcome Banner & Account Switcher */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div className="text-left space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Hello, {displayName || 'Reader'}
                </h1>
                <span className="px-2 py-0.5 bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-mono rounded-full text-indigo-300 uppercase font-bold tracking-wider">
                  {userRole}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-lg leading-relaxed">
                {bio || "Welcome to your personal digital publishing learning matrix. Sync bookmarks, monitor daily goals, and access customized AI recommendations."}
              </p>
              <div className="flex items-center space-x-1.5 text-indigo-300/70 text-[11px] font-mono font-medium">
                <Mail className="w-3.5 h-3.5" />
                <span>{activeEmail}</span>
              </div>
            </div>
          </div>

          {/* Account Switcher panel */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-2xl p-4 w-full md:w-auto shrink-0 text-left">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">Switch Reader Account</h4>
            <form onSubmit={handleSwitchEmail} className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter user email..."
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[180px]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white transition-all shadow-md shadow-indigo-900/10"
              >
                Sync
              </button>
            </form>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-normal">
              Entering a custom email pulls its saved telemetry, history, & bookmarks natively.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="mt-4 text-xs font-medium text-gray-500">Retrieving personalized telemetry...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-red-100 rounded-3xl space-y-3 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="font-bold text-gray-800">Connection Failed</h3>
          <p className="text-xs text-gray-500">{error}</p>
          <button 
            onClick={() => fetchProfile(activeEmail)}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* LEFT 8-COLUMN COLUMN: Bookmarks, History & Recommendations */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gamified Stat Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Daily Streak Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-500 shrink-0">
                  <Flame className="w-6 h-6 fill-amber-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">Reading Streak</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-gray-900">{profile?.streakCount || 0}</span>
                    <span className="text-xs font-semibold text-gray-500">Days</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-medium block">
                    {profile?.streakCount && profile.streakCount > 0 ? "🔥 Hot streak! Keep it up" : "Read an article to start streak"}
                  </span>
                </div>
              </div>

              {/* Daily Goal Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">Daily Goal</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-gray-900">{goalMinutes}</span>
                    <span className="text-xs font-semibold text-gray-500">Min/Day</span>
                  </div>
                  {/* Visual goal bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, ((profile?.readingHistory?.length || 1) * 3 / goalMinutes) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Saved Articles Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-violet-50 rounded-xl text-violet-600 shrink-0">
                  <Bookmark className="w-6 h-6 fill-violet-400/30" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">Saved Articles</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-gray-900">{profile?.bookmarks?.length || 0}</span>
                    <span className="text-xs font-semibold text-gray-500">Bookmarked</span>
                  </div>
                  <span className="text-[10px] text-violet-600 font-semibold block">
                    {profile?.bookmarks?.length && profile.bookmarks.length > 0 ? "Saved for offline reading" : "No saved content"}
                  </span>
                </div>
              </div>

            </div>

            {/* Saved Bookmarks Manager */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                  <h3 className="font-sans font-black text-sm text-gray-900 uppercase tracking-wide">
                    Your Saved Bookmarks ({bookmarkedArticles.length})
                  </h3>
                </div>
              </div>

              {bookmarkedArticles.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-gray-100 rounded-2xl">
                  <Bookmark className="w-8 h-8 text-gray-350 mx-auto stroke-1" />
                  <p className="text-xs font-bold text-gray-400">Your bookmark queue is currently empty.</p>
                  <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                    Browse active publication lists on our articles page and select the Bookmark icon to pin items here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedArticles.map(art => (
                    <div 
                      key={art.id}
                      className="bg-slate-50 hover:bg-slate-100/60 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between space-y-3 group transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-indigo-600 font-bold">
                          <span>{art.category}</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-800 line-clamp-2 mt-1 leading-normal group-hover:text-indigo-600 transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed mt-1">
                          {art.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-150/50 text-[10px]">
                        <button
                          onClick={() => onReadArticle(art)}
                          className="font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
                        >
                          <span>Read Now</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveBookmark(art.id)}
                          className="text-gray-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom AI recommendations & Suggested Guides */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-1.5 border-b border-gray-50 pb-3">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <h3 className="font-sans font-black text-sm text-gray-900 uppercase tracking-wide">
                  Tailored Publications Matrix
                </h3>
              </div>

              {recommendedArticles.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 bg-slate-50/50 rounded-2xl border border-gray-100">
                  Select your Preferred Categories in Profile Settings to unlock automated AI matching recommendations!
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedArticles.map(art => (
                    <div 
                      key={art.id}
                      onClick={() => onReadArticle(art)}
                      className="p-3 bg-white hover:bg-indigo-50/20 border border-gray-100 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center space-x-3 text-left">
                        {art.featuredImage && (
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                            <img src={art.featuredImage} alt={art.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wide">{art.category}</span>
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-snug">
                            {art.title}
                          </h4>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reading History */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-sans font-black text-sm text-gray-900 uppercase tracking-wide">
                    Telemetry & Reading History
                  </h3>
                </div>
              </div>

              {historyArticles.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No telemetry sessions tracked yet. Open and read articles to establish reading histories and streak records automatically.
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {historyArticles.map((hist, idx) => (
                    <div key={idx} className="flex items-start space-x-4 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono font-bold text-gray-500 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 
                            onClick={() => onReadArticle(hist.article)}
                            className="font-bold text-xs text-gray-800 hover:text-indigo-600 cursor-pointer line-clamp-1 transition-colors leading-snug"
                          >
                            {hist.article.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(hist.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="text-indigo-600 font-bold">{hist.article.category}</span>
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">
                            COMPLETED READ
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 4-COLUMN COLUMN: Profile Settings & Author Following */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* PayPal Premium Membership Status Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800 space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <h3 className="font-sans font-black text-xs uppercase tracking-wide text-indigo-300">
                    Premium Membership
                  </h3>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase tracking-wider ${
                  profile?.isPremium 
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}>
                  {profile?.isPremium ? 'Active' : 'Free Tier'}
                </span>
              </div>

              {profile?.isPremium ? (
                <div className="space-y-4 text-left animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase block">Monetization Channel</span>
                    <span className="text-sm font-black text-white flex items-center space-x-1.5">
                      <span>PayPal Recurring Subscription</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Account</span>
                      <span className="font-semibold text-slate-300 truncate block text-[11px]" title={profile.paypalEmail}>
                        {profile.paypalEmail || 'Connected'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Billing Cycle</span>
                      <span className="font-semibold text-slate-300 block text-[11px]">$19.99/mo</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800/60 mt-1">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Subscription ID</span>
                      <span className="font-mono text-amber-400 text-[10px] truncate block">
                        {profile.paypalSubscriptionId || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 rounded-xl text-[11px] font-bold text-rose-400 transition-all text-center"
                    >
                      Cancel PayPal Subscription
                    </button>
                    <p className="text-[9px] text-slate-500 text-center leading-normal">
                      Managed securely via PayPal automatic billing integration.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block">Upgrade for exclusive developer privileges</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-white">$19.99</span>
                      <span className="text-xs font-medium text-indigo-300">/ Month</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-[11px] text-slate-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Immediate access to high-value prompt packs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Download exclusive architectural blueprints</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Premium priority learning path guides</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => setShowPaypalModal(true)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Connect & Pay with PayPal</span>
                  </button>
                  <p className="text-[9px] text-slate-500 text-center">
                    Seamless subscription setup. Safe & secure sandbox environment enabled.
                  </p>
                </div>
              )}
            </div>

            {/* PayPal Checkout Modal Overlay */}
            {showPaypalModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-left space-y-5 animate-in zoom-in-95 duration-200">
                  
                  {/* PayPal Logo Mock */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-1 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                      <span className="text-blue-900 font-extrabold text-sm tracking-tighter italic">Pay</span>
                      <span className="text-sky-500 font-extrabold text-sm tracking-tighter italic">Pal</span>
                      <span className="text-indigo-900 font-bold text-[9px] uppercase tracking-widest pl-1 font-mono border-l border-sky-200/60 ml-1">SANDBOX</span>
                    </div>
                    <button 
                      onClick={() => setShowPaypalModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 hover:bg-slate-50 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Transaction Header */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Order Description</span>
                    <h3 className="font-bold text-xs text-slate-800 leading-tight">
                      Nexus Premium Membership Plan
                    </h3>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-[11px] text-slate-500">Auto-recurring Monthly Plan</span>
                      <span className="text-sm font-black text-slate-900">$19.99 USD</span>
                    </div>
                  </div>

                  <form onSubmit={handlePaypalUpgrade} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">PayPal Email</label>
                      <input 
                        type="email"
                        value={paypalEmailInput}
                        onChange={(e) => setPaypalEmailInput(e.target.value)}
                        placeholder="your-paypal-email@domain.com"
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">PayPal Password</label>
                      <input 
                        type="password"
                        value={paypalPasswordInput}
                        onChange={(e) => setPaypalPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1 text-[9px] text-slate-400 leading-normal">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
                      <span>Encrypted SSL Sandbox checkout portal. No real funds charged.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={paypalProcessing}
                      className="w-full py-3 mt-2 bg-yellow-400 hover:bg-yellow-350 text-blue-900 font-sans font-black text-xs rounded-xl shadow-lg shadow-yellow-100 transition-all flex items-center justify-center space-x-1.5"
                    >
                      {paypalProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Authorizing PayPal...</span>
                        </>
                      ) : (
                        <>
                          <span>Agree & Pay Now</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Interactive Profile Editor */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center space-x-1.5 border-b border-gray-50 pb-2">
                <Edit className="w-4 h-4 text-indigo-500" />
                <h3 className="font-sans font-black text-xs text-gray-900 uppercase tracking-wide">
                  Edit Reader Settings
                </h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Display Name Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full bg-slate-50 border border-gray-150 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                {/* Short Bio Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Biography</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief developer bio or interests..."
                    className="w-full bg-slate-50 border border-gray-150 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium h-20 resize-none"
                  />
                </div>

                {/* Daily Reading Goal Minutes */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400">Daily Reading Goal</label>
                    <span className="text-xs font-black text-indigo-600">{goalMinutes} mins</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Preferred Categories Preferences (Checkboxes) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400 block">Preferred Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map(cat => {
                      const isSelected = preferredCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryCheckbox(cat)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-left border transition-all ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                              : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-1.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>

                {saveSuccess && (
                  <div className="p-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 text-center flex items-center justify-center space-x-1 animate-pulse">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Settings persisted securely on database!</span>
                  </div>
                )}

              </form>
            </div>

            {/* Simulated Author Following list */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-1.5 border-b border-gray-50 pb-2">
                <UserCheck className="w-4 h-4 text-violet-500 shrink-0" />
                <h3 className="font-sans font-black text-xs text-gray-900 uppercase tracking-wide">
                  Authors you Follow
                </h3>
              </div>

              <div className="space-y-4">
                {authorsToFollow.map(auth => {
                  const isFollowing = followedAuthors.includes(auth.name);
                  return (
                    <div key={auth.name} className="flex items-center justify-between text-left">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={auth.avatar} 
                          alt={auth.name} 
                          className="w-9 h-9 rounded-full object-cover border border-gray-150 shrink-0" 
                        />
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-gray-800 leading-none">{auth.name}</h4>
                          <p className="text-[9px] text-gray-400 line-clamp-1 leading-normal max-w-[140px]">{auth.role}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFollowAuthor(auth.name)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          isFollowing
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'
                            : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
