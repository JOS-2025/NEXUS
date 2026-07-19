import React from 'react';
import { Search, Sparkles, Flame, Eye, Heart, Calendar, Newspaper, ArrowRight, BookOpen, AlertCircle, RefreshCw, Bookmark, Star } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Article, AITool, Resource } from './types';
import Navbar from './components/Navbar';
import NewsletterSubscription from './components/NewsletterSubscription';
import AIToolsDirectory from './components/AIToolsDirectory';
import ResourceLibrary from './components/ResourceLibrary';
import CmsStudio from './components/CmsStudio';
import AdminAnalytics from './components/AdminAnalytics';
import ArticleView from './components/ArticleView';
import DigitalPublishingOperationsCenter from './components/DigitalPublishingOperationsCenter';
import AboutContact from './components/AboutContact';
import LegalPages from './components/LegalPages';
import Footer from './components/Footer';
import ReaderDashboard from './components/ReaderDashboard';
import PublicAuthorProfile from './components/PublicAuthorProfile';
import SearchCommandHub from './components/SearchCommandHub';
import { CookieConsentBanner, CookiePreferencesPage } from './components/CookieConsentManager';
import AuthModal from './components/AuthModal';
import SettingsDashboard from './components/SettingsDashboard';

export default function App() {
  const [currentTab, setCurrentTab] = React.useState<string>('home');
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);
  const [viewingAuthor, setViewingAuthor] = React.useState<{ id?: string, name: string } | null>(null);
  
  // Dynamic Authentication States
  const [userProfile, setUserProfile] = React.useState<any>(() => {
    const saved = localStorage.getItem('nexus_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [userRole, setUserRole] = React.useState<'anonymous' | 'registered' | 'author' | 'editor' | 'admin'>(() => {
    const saved = localStorage.getItem('nexus_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const role = u.role || 'registered';
        if (role === 'admin' && u.email?.toLowerCase().trim() !== 'josphatmuchemi976@gmail.com') {
          return 'registered';
        }
        return role;
      } catch (e) {
        return 'registered';
      }
    }
    return 'admin'; // keep default as admin for open exploring
  });

  const [activeEmail, setActiveEmail] = React.useState<string>(() => {
    const saved = localStorage.getItem('nexus_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.email || 'josphatmuchemi976@gmail.com';
      } catch (e) {
        return 'josphatmuchemi976@gmail.com';
      }
    }
    return 'josphatmuchemi976@gmail.com';
  });

  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<string[]>([]);

  const handleAuthSuccess = (profile: any) => {
    setUserProfile(profile);
    setUserRole(profile.role || 'registered');
    setActiveEmail(profile.email);
    localStorage.setItem('nexus_user', JSON.stringify(profile));
  };

  const handleSignOut = () => {
    setUserProfile(null);
    setUserRole('anonymous');
    setActiveEmail('');
    localStorage.removeItem('nexus_user');
  };
  
  // Filtering and Feed search
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');

  // Search Hub states
  const [tools, setTools] = React.useState<AITool[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [isSearchHubOpen, setIsSearchHubOpen] = React.useState(false);
  const [initialSelectedToolId, setInitialSelectedToolId] = React.useState<string | undefined>(undefined);
  const [initialSelectedResourceId, setInitialSelectedResourceId] = React.useState<string | undefined>(undefined);

  // Articles state
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Could not pull latest publications.');
      const data = await res.json();
      setArticles(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching feed data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectoryData = async () => {
    try {
      const [toolsRes, resRes] = await Promise.all([
        fetch('/api/ai-tools'),
        fetch('/api/resources')
      ]);
      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(toolsData);
      }
      if (resRes.ok) {
        const resData = await resRes.json();
        setResources(resData);
      }
    } catch (err) {
      console.error('Failed to fetch search index directory data:', err);
    }
  };

  const fetchBookmarks = async (email: string) => {
    if (!email || email === 'anonymous') {
      setBookmarks([]);
      return;
    }
    try {
      const res = await fetch(`/api/reader/profile?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  const handleToggleBookmark = async (articleId: string) => {
    const isBookmarked = bookmarks.includes(articleId);
    const endpoint = isBookmarked ? '/api/reader/bookmark/remove' : '/api/reader/bookmark';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, articleId })
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  React.useEffect(() => {
    fetchArticles();
    fetchDirectoryData();
  }, []);

  React.useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchHubOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  React.useEffect(() => {
    fetchBookmarks(activeEmail);
  }, [activeEmail]);

  React.useEffect(() => {
    if (userProfile) {
      const email = userProfile.email || '';
      setActiveEmail(email);
      // Defensive check: Only josphatmuchemi976@gmail.com can be an administrator
      if (userRole === 'admin' && email.toLowerCase().trim() !== 'josphatmuchemi976@gmail.com') {
        setUserRole('registered');
      }
      return;
    }

    // Default simulation presets
    if (userRole === 'admin') {
      setActiveEmail('josphatmuchemi976@gmail.com');
    } else if (userRole === 'author') {
      setActiveEmail('sarah.chen@nexus.ai');
    } else if (userRole === 'editor') {
      setActiveEmail('editor@nexus.ai');
    } else if (userRole === 'registered') {
      setActiveEmail('registered-reader@nexus.ai');
    } else {
      setActiveEmail('anonymous');
    }
  }, [userRole, userProfile]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedArticle(null);
  };

  // Trigger when a reader clicks an article card
  const handleReadArticle = async (art: Article) => {
    setSelectedArticle(art);
    setCurrentTab('home'); // keep tab home to display deep article view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      // Real-time backend increment for article view count
      const res = await fetch(`/api/articles/${art.id}/view`, { method: 'POST' });
      if (res.ok) {
        // Refresh local items state to keep view counts accurate on return
        const fresh = await res.json();
        setArticles(prev => prev.map(a => a.id === art.id ? { ...a, viewsCount: fresh.viewsCount } : a));
      }

      // Record reading session / history telemetry in backend
      await fetch('/api/reading-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerEmail: activeEmail,
          articleId: art.id,
          scrollDepth: 100,
          completed: true,
          engagementTimeSeconds: 120
        })
      });
      fetchBookmarks(activeEmail);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter computation
  const filteredArticles = articles.filter((art) => {
    // Search match
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category match
    const matchesCategory = selectedCategory
      ? art.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;

    // Filter out drafts unless authorized role is inspecting feed
    const matchesStatus = ['author', 'editor', 'admin'].includes(userRole)
      ? true
      : art.status === 'published';

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    }
    if (sortBy === 'views') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    if (sortBy === 'likes') {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    return 0;
  });

  // Hot/Trending Articles (Sorted by viewsCount descending)
  const trendingArticles = [...articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 4);

  const categories = ['Artificial Intelligence', 'Productivity', 'Entrepreneurship', 'Technology'];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-gray-800">
      
      {/* Universal Sticky Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'home') {
            setSelectedArticle(null); // clear reading state on nav jump
          }
        }}
        userRole={userRole}
        setUserRole={setUserRole}
        onClearFilters={handleClearFilters}
        onArticleSelect={(art) => {
          setSelectedArticle(art);
          setCurrentTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        articles={articles}
        activeEmail={activeEmail}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Page Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render Tab Views dynamically */}
        {currentTab === 'home' && (
          <>
            {selectedArticle ? (
              <ArticleView
                article={selectedArticle}
                onBack={() => {
                  setSelectedArticle(null);
                  fetchArticles(); // refresh metrics on return
                }}
                userRole={userRole}
                activeEmail={activeEmail}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onAuthorClick={(id, name) => setViewingAuthor({ id, name })}
                articles={articles}
                onArticleSelect={(art) => {
                  setSelectedArticle(art);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="space-y-12">
                
                {/* Visual Editorial Welcome Hero */}
                <div id="home-hero-jumbo" className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-xs text-left">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  
                  <div className="relative max-w-3xl space-y-4">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100/40">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Elite Digital Publication Terminal</span>
                    </div>

                    <h1 className="font-sans font-black text-3xl sm:text-5xl text-gray-900 tracking-tight leading-none">
                      Democratizing Artificial Intelligence, <br className="hidden sm:inline" />
                      Productivity Frameworks & Solopreneurship.
                    </h1>

                    <p className="font-sans text-sm sm:text-base text-gray-500 max-w-2xl leading-relaxed">
                      Written by engineers, curated by product leaders, verified by live telemetry. 
                      Unlock professional-grade checklists, active AI tools matrices, and custom Gemini summaries.
                    </p>

                    {/* Responsive Statistics Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 mt-6 text-left">
                      <div className="space-y-1">
                        <span className="block text-2xl sm:text-3xl font-black text-indigo-600 font-sans tracking-tight">12.4K+</span>
                        <span className="block text-[10px] sm:text-xs font-bold font-mono text-gray-400 uppercase tracking-wide">Verified Members</span>
                      </div>
                      <div className="space-y-1 border-x border-gray-100 px-4 sm:px-6">
                        <span className="block text-2xl sm:text-3xl font-black text-indigo-600 font-sans tracking-tight">8.9K+</span>
                        <span className="block text-[10px] sm:text-xs font-bold font-mono text-gray-400 uppercase tracking-wide">Newsletter Readers</span>
                      </div>
                      <div className="space-y-1 pl-2">
                        <span className="block text-2xl sm:text-3xl font-black text-indigo-600 font-sans tracking-tight">150+</span>
                        <span className="block text-[10px] sm:text-xs font-bold font-mono text-gray-400 uppercase tracking-wide">AI Tools & Prompts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Testimonials Grid */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-left">
                    <span className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">★ Real Platform Testimonials</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                      {
                        name: "Sarah Chen",
                        role: "Principal AI Architect at Nexus",
                        text: "The directory's Pros & Cons matrices are incredibly precise. They completely saved us from hours of trial and error with prompt-testing pipelines.",
                        stars: 5,
                        avatar: "S"
                      },
                      {
                        name: "Liam Sterling",
                        role: "Founder, Sterling Micro-SaaS",
                        text: "Having direct partner affiliate discounts combined with rigorous alternative comparisons in one single dashboard makes Nexus an absolute game-changer.",
                        stars: 5,
                        avatar: "L"
                      },
                      {
                        name: "Marcus Aurelius",
                        role: "Independent Solopreneur & Writer",
                        text: "The prompt packs and checklist downloads in the resources library are worth a premium subscription. The design is clean and fluid.",
                        stars: 5,
                        avatar: "M"
                      }
                    ].map((t, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between hover:border-indigo-100 transition-colors">
                        <div className="space-y-2.5">
                          <div className="flex items-center space-x-1">
                            {[...Array(t.stars)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-500 shrink-0" />
                            ))}
                          </div>
                          <p className="font-sans text-xs text-gray-600 leading-relaxed italic">
                            "{t.text}"
                          </p>
                        </div>
                        <div className="flex items-center space-x-2.5 pt-3 border-t border-gray-50">
                          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100/30 text-indigo-700 font-mono font-bold text-xs rounded-full flex items-center justify-center shrink-0">
                            {t.avatar}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-gray-900 leading-none">{t.name}</span>
                            <span className="block text-[10px] font-medium text-gray-400 truncate mt-1">{t.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filter and Search Action row */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100 pb-6 text-left">
                  {/* Category Pills list */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selectedCategory === null
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Articles
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          selectedCategory === cat
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                            : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search and Sort Dropdown Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                    {/* Sort Dropdown */}
                    <div className="relative w-full sm:w-44 shrink-0">
                      <select
                        id="feed-sort-dropdown"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-white border border-gray-100 rounded-xl pl-3 pr-8 py-2.5 text-xs font-semibold text-gray-700 hover:border-indigo-100 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="views">Most Viewed</option>
                        <option value="likes">Most Liked</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Universal Search Trigger */}
                    <div 
                      onClick={() => setIsSearchHubOpen(true)}
                      className="relative w-full md:w-80 cursor-pointer group"
                      title="Open Universal Command Hub (Ctrl+K)"
                    >
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 group-hover:text-indigo-500 transition-colors" />
                      <div className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-400 flex items-center justify-between font-medium hover:border-indigo-100 transition-colors">
                        <span>Search global resources...</span>
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-150 rounded-md text-[9px] font-bold text-gray-400 select-none">
                          <span>⌘K</span>
                        </kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main feed list loading/error handling */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm font-medium text-gray-500">Formulating publishing feed...</p>
                  </div>
                ) : error ? (
                  <div className="max-w-md mx-auto py-12 text-center space-y-3 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <h3 className="font-bold text-gray-900 text-sm">Communication Timeout</h3>
                    <p className="text-xs text-gray-500 leading-normal">{error}</p>
                    <button
                      onClick={fetchArticles}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                    
                    {/* Primary Articles List Feed (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                      {filteredArticles.length === 0 ? (
                        <div className="bg-white border border-gray-100 p-12 text-center rounded-3xl space-y-2">
                          <p className="text-sm font-semibold text-gray-500">No published articles match current filter criteria.</p>
                          <button
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Clear search filters
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {filteredArticles.map((art) => (
                            <div
                              key={art.id}
                              id={`feed-item-card-${art.id}`}
                              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs hover:shadow-lg hover:scale-[1.015] hover:border-indigo-100/40 transition-all duration-300 flex flex-col sm:flex-row gap-6 group cursor-pointer"
                              onClick={() => handleReadArticle(art)}
                            >
                              {/* Left column: featured image snippet */}
                              {art.featuredImage && (
                                <div className="sm:w-48 h-32 w-full rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-50">
                                  <img
                                    src={art.featuredImage}
                                    alt={art.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}

                              {/* Right column: Info details */}
                              <div className="flex-1 flex flex-col justify-between space-y-2">
                                <div>
                                  {/* Status badge in CMS mode */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                                      {art.category}
                                    </span>
                                    {art.status === 'draft' && (
                                      <span className="text-[9px] font-mono font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                        Draft Edit
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="font-sans font-bold text-base sm:text-lg text-gray-900 group-hover:text-indigo-600 leading-snug transition-colors line-clamp-2 mt-1">
                                    {art.title}
                                  </h3>

                                  <p className="font-sans text-xs text-gray-500 line-clamp-2 leading-relaxed mt-1">
                                    {art.summary || art.content}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-50">
                                  <div className="flex items-center space-x-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingAuthor({ id: art.authorId, name: art.authorName });
                                      }}
                                      className="text-gray-700 font-bold hover:text-indigo-600 hover:underline cursor-pointer focus:outline-hidden"
                                      title={`View profile of ${art.authorName}`}
                                    >
                                      {art.authorName}
                                    </button>
                                    <span className="text-gray-300">•</span>
                                    <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                                  </div>

                                  <div className="flex items-center space-x-3 text-slate-400">
                                    <span className="flex items-center space-x-0.5">
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>{art.viewsCount}</span>
                                    </span>
                                    <span className="flex items-center space-x-0.5">
                                      <Heart className="w-3.5 h-3.5 fill-rose-150/40" />
                                      <span>{art.likesCount}</span>
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleBookmark(art.id);
                                      }}
                                      className={`p-1 rounded-md hover:bg-slate-100 hover:text-indigo-600 transition-colors ${
                                        bookmarks.includes(art.id) ? 'text-indigo-600' : 'text-slate-400'
                                      }`}
                                      title={bookmarks.includes(art.id) ? 'Remove Bookmark' : 'Bookmark Article'}
                                    >
                                      <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(art.id) ? 'fill-indigo-600' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Secondary Widgets Rail (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* Trending Articles Card (views sorting) */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center space-x-1.5 border-b border-gray-50 pb-2">
                          <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                          <h4 className="font-sans font-bold text-xs text-gray-900 uppercase tracking-wide">
                            Trending Bulletins
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {trendingArticles.map((t, idx) => (
                            <div
                              key={t.id}
                              onClick={() => handleReadArticle(t)}
                              className="flex items-start space-x-3 cursor-pointer group py-1 border-b border-gray-50/50 last:border-0"
                            >
                              <span className="font-mono text-xs font-black text-gray-300 group-hover:text-indigo-600 mt-0.5">
                                0{idx + 1}
                              </span>
                              <div className="space-y-0.5">
                                <h5 className="font-semibold text-xs text-gray-800 leading-snug group-hover:text-indigo-600 line-clamp-2 transition-colors">
                                  {t.title}
                                </h5>
                                <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-medium">
                                  <span className="text-indigo-600 font-semibold">{t.category}</span>
                                  <span>•</span>
                                  <span>{t.viewsCount} reads</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Side newsletter call */}
                      <NewsletterSubscription variant="standard" />

                    </div>

                  </div>
                  
                  {/* Prominent Full-Width Newsletter Subscription section on Homepage */}
                  <div className="mt-12">
                    <NewsletterSubscription variant="hero" />
                  </div>
                  </>
                )}

              </div>
            )}
          </>
        )}

        {currentTab === 'tools' && (
          <AIToolsDirectory 
            userRole={userRole} 
            initialSelectedToolId={initialSelectedToolId}
            onClearInitialSelectedToolId={() => setInitialSelectedToolId(undefined)}
          />
        )}

        {currentTab === 'resources' && (
          <ResourceLibrary 
            userRole={userRole} 
            initialSelectedResourceId={initialSelectedResourceId}
            onClearInitialSelectedResourceId={() => setInitialSelectedResourceId(undefined)}
          />
        )}

        {currentTab === 'dashboard' && (
          <ReaderDashboard
            userRole={userRole}
            activeEmail={activeEmail}
            setActiveEmail={setActiveEmail}
            articles={articles}
            onReadArticle={handleReadArticle}
            onRefreshArticles={fetchArticles}
          />
        )}

        {currentTab === 'cms' && (
          <CmsStudio
            userRole={userRole}
            articles={articles}
            onRefreshArticles={fetchArticles}
          />
        )}

        {currentTab === 'analytics' && (
          userRole === 'admin' ? (
            <DigitalPublishingOperationsCenter
              userRole={userRole}
              articles={articles}
              onRefreshArticles={fetchArticles}
              onSetTab={setCurrentTab}
            />
          ) : (
            <AdminAnalytics userRole={userRole} />
          )
        )}

        {currentTab === 'about' && (
          <AboutContact />
        )}

        {currentTab === 'terms' && (
          <LegalPages
            initialTab="terms"
            onBack={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'privacy' && (
          <LegalPages
            initialTab="privacy"
            onBack={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'cookie-preferences' && (
          <CookiePreferencesPage
            activeEmail={activeEmail}
            userRole={userRole}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsDashboard activeEmail={activeEmail} />
        )}

      </main>

      {/* Persistent global footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticle(null);
        }}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedArticle(null);
        }}
      />

      <AnimatePresence>
        {viewingAuthor && (
          <PublicAuthorProfile
            authorId={viewingAuthor.id}
            authorName={viewingAuthor.name}
            onClose={() => setViewingAuthor(null)}
            onArticleClick={(article) => {
              setSelectedArticle(article);
              setCurrentTab('home'); // Ensure we are on home tab to view the article
            }}
          />
        )}
        {isSearchHubOpen && (
          <SearchCommandHub
            isOpen={isSearchHubOpen}
            onClose={() => setIsSearchHubOpen(false)}
            articles={articles}
            tools={tools}
            resources={resources}
            onSelectArticle={(art) => {
              setSelectedArticle(art);
              setCurrentTab('home');
            }}
            onSelectTool={(tool) => {
              setInitialSelectedToolId(tool.id);
              setCurrentTab('tools');
            }}
            onSelectResource={(res) => {
              setInitialSelectedResourceId(res.id);
              setCurrentTab('resources');
            }}
          />
        )}
      </AnimatePresence>

      <CookieConsentBanner 
        activeEmail={activeEmail} 
        onOpenPreferences={() => {
          setCurrentTab('cookie-preferences');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
            onAuthSuccess={handleAuthSuccess} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}
