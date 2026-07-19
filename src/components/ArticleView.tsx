import React from 'react';
import { ArrowLeft, Clock, Calendar, Heart, Share2, Sparkles, CheckCircle, Loader2, Bookmark, ArrowRight, Github, Twitter, Linkedin, Globe, Mail, User, ListTree, ChevronDown, ChevronUp } from 'lucide-react';
import { Article } from '../types';
import CommentSection from './CommentSection';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  userRole: string;
  activeEmail?: string;
  bookmarks?: string[];
  onToggleBookmark?: (articleId: string) => Promise<void>;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  articles?: Article[];
  onArticleSelect?: (article: Article) => void;
}

export default function ArticleView({ 
  article, 
  onBack, 
  userRole, 
  activeEmail = 'anonymous', 
  bookmarks = [], 
  onToggleBookmark,
  onAuthorClick,
  articles = [],
  onArticleSelect
}: ArticleViewProps) {
  const [likesCount, setLikesCount] = React.useState(article.likesCount);
  const [hasLiked, setHasLiked] = React.useState(false);
  
  // AI summary states
  const [aiSummary, setAiSummary] = React.useState<string | null>(article.summary || null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);

  // Scroll reading progress tracking state
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [fontSize, setFontSize] = React.useState<'small' | 'medium' | 'large'>('medium');

  const [mobileTocOpen, setMobileTocOpen] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string>('');

  const headings = React.useMemo(() => {
    const list: { id: string; text: string; level: 'h2' | 'h3'; index: number }[] = [];
    if (!article || !article.content) return list;
    
    const paragraphs = article.content.split('\n\n');
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        const text = paragraph.replace('### ', '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${index}`;
        list.push({ id, text, level: 'h3', index });
      } else if (paragraph.startsWith('## ')) {
        const text = paragraph.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${index}`;
        list.push({ id, text, level: 'h2', index });
      }
    });
    return list;
  }, [article.content]);

  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -40% 0px', threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const handleHeadingClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  interface AuthorProfile {
    authorId?: string;
    displayName: string;
    role: string;
    bio?: string;
    email?: string;
    socialLinks?: {
      github?: string;
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  }

  const [authorProfile, setAuthorProfile] = React.useState<AuthorProfile | null>(null);
  const [loadingAuthor, setLoadingAuthor] = React.useState(true);

  React.useEffect(() => {
    setLikesCount(article.likesCount);
    setAiSummary(article.summary || null);
    setScrollProgress(0); // Reset progress on article change
  }, [article]);

  React.useEffect(() => {
    async function fetchAuthorProfile() {
      setLoadingAuthor(true);
      try {
        const identifier = article.authorId || article.authorName;
        const res = await fetch(`/api/authors/${encodeURIComponent(identifier)}`);
        if (res.ok) {
          const data = await res.json();
          setAuthorProfile(data);
        } else {
          setAuthorProfile({
            displayName: article.authorName,
            role: article.authorRole || 'Author',
            bio: 'Contributing Specialist at Nexus, focusing on modern frameworks, system integrations, and secure developer workflows.',
          });
        }
      } catch (err) {
        console.error('Error fetching author profile:', err);
        setAuthorProfile({
          displayName: article.authorName,
          role: article.authorRole || 'Author',
          bio: 'Contributing Specialist at Nexus, focusing on modern frameworks, system integrations, and secure developer workflows.',
        });
      } finally {
        setLoadingAuthor(false);
      }
    }
    fetchAuthorProfile();
  }, [article.id, article.authorId, article.authorName, article.authorRole]);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Force immediate check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [article]);

  const relatedArticles = React.useMemo(() => {
    if (!articles || !article) return [];
    
    // Filter out current article and ensure it is published
    const available = articles.filter(art => art.id !== article.id && art.status === 'published');
    
    const primaryTag = article.tags && article.tags.length > 0 ? article.tags[0] : null;
    
    let matched: Article[] = [];
    if (primaryTag) {
      matched = available.filter(art => art.tags && art.tags.includes(primaryTag));
    }
    
    // If we have at least 3, we take them
    if (matched.length >= 3) {
      return matched.slice(0, 3);
    }
    
    // Otherwise, fill up to 3 with other articles sharing ANY tag of the current article
    const matchedIds = new Set(matched.map(m => m.id));
    const otherTagMatches = available.filter(art => {
      if (matchedIds.has(art.id)) return false;
      return article.tags && article.tags.some(t => art.tags && art.tags.includes(t));
    });
    
    let combined = [...matched, ...otherTagMatches];
    if (combined.length >= 3) {
      return combined.slice(0, 3);
    }
    
    // Otherwise, fill up with same-category articles
    const combinedIds = new Set(combined.map(m => m.id));
    const sameCategory = available.filter(art => !combinedIds.has(art.id) && art.category === article.category);
    
    combined = [...combined, ...sameCategory];
    if (combined.length >= 3) {
      return combined.slice(0, 3);
    }
    
    // Otherwise, fill up with any other available published articles
    const finalIds = new Set(combined.map(m => m.id));
    const others = available.filter(art => !finalIds.has(art.id));
    
    return [...combined, ...others].slice(0, 3);
  }, [articles, article]);

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await fetch(`/api/articles/${article.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likesCount);
        setHasLiked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDynamicAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: article.content }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.summary || `Read "${article.title}" on Nexus`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Native sharing failed, using fallback:', err);
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const fontSizeClasses = {
    small: {
      body: 'text-xs sm:text-sm leading-relaxed',
      list: 'list-disc pl-5 space-y-1.5 text-[11px] sm:text-xs text-gray-600',
      h3: 'font-sans font-black text-base text-gray-900 pt-2',
      h2: 'font-sans font-black text-lg text-gray-900 pt-3 border-b border-gray-50 pb-1'
    },
    medium: {
      body: 'text-sm sm:text-base leading-relaxed',
      list: 'list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600',
      h3: 'font-sans font-black text-lg text-gray-900 pt-3',
      h2: 'font-sans font-black text-xl text-gray-900 pt-4 border-b border-gray-50 pb-1'
    },
    large: {
      body: 'text-base sm:text-lg leading-relaxed',
      list: 'list-disc pl-5 space-y-1.5 text-sm sm:text-base text-gray-600',
      h3: 'font-sans font-black text-xl text-gray-900 pt-4',
      h2: 'font-sans font-black text-2xl text-gray-900 pt-5 border-b border-gray-50 pb-1'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 animate-in fade-in duration-300 relative">
      
      {/* Dynamic Scroll-based Reading Progress Bar */}
      <div 
        id="reading-progress-container"
        className="fixed top-0 left-0 w-full h-1 bg-gray-150/10 z-[250] select-none pointer-events-none"
      >
        <div 
          id="reading-progress-fill"
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Main Article Body & Utilities */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 min-w-0">
      
      {/* Upper header action row */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-100/50 pb-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Articles</span>
        </button>

        {/* Font-size Adjustment Control */}
        <div id="font-size-controls" className="flex items-center space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase px-2 select-none">Font</span>
          <button
            id="font-size-small"
            title="Small font size"
            onClick={() => setFontSize('small')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              fontSize === 'small' 
                ? 'bg-white text-indigo-600 shadow-xs border border-gray-100 font-bold' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            A
          </button>
          <button
            id="font-size-medium"
            title="Medium font size"
            onClick={() => setFontSize('medium')}
            className={`px-2.5 py-1 text-sm font-medium rounded-lg transition-all ${
              fontSize === 'medium' 
                ? 'bg-white text-indigo-600 shadow-xs border border-gray-100 font-bold' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            A
          </button>
          <button
            id="font-size-large"
            title="Large font size"
            onClick={() => setFontSize('large')}
            className={`px-2.5 py-1 text-base font-medium rounded-lg transition-all ${
              fontSize === 'large' 
                ? 'bg-white text-indigo-600 shadow-xs border border-gray-100 font-bold' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            A
          </button>
        </div>
      </div>

      {/* Article Header info */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-100/35 rounded-md inline-block">
          {article.category}
        </span>
        
        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-900 leading-tight tracking-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-b border-gray-100 pb-5">
          <button 
            onClick={() => onAuthorClick?.(article.authorId, article.authorName)}
            className="flex items-center space-x-2 group cursor-pointer text-left focus:outline-hidden"
            title={`View profile of ${article.authorName}`}
          >
            <img
              src={article.authorAvatar}
              alt={article.authorName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-gray-100 bg-gray-50 object-cover group-hover:scale-105 group-hover:border-indigo-150 transition-all duration-300"
            />
            <div>
              <span className="font-bold text-gray-800 block group-hover:text-indigo-600 group-hover:underline transition-colors">{article.authorName}</span>
              <span className="text-[10px] font-mono text-gray-400 block">{article.authorRole}</span>
            </div>
          </button>

          <div className="h-4 w-px bg-gray-200"></div>

          <div className="flex items-center space-x-1 font-medium">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>

          <div className="h-4 w-px bg-gray-200"></div>

          <div className="flex items-center space-x-1 font-medium">
            <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* Featured Banner Image */}
      {article.featuredImage && (
        <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden shadow-inner border border-gray-100">
          <img
            src={article.featuredImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* AI Summary Highlights Box */}
      {aiSummary ? (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl shadow-slate-900/5 animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-500/15 rounded-lg text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black font-sans tracking-wide text-white">Gemini AI Executive Summary</h4>
                <span className="font-mono text-[9px] uppercase font-bold text-indigo-400 tracking-wider">3-Point Key Takeaways</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2 prose-invert whitespace-pre-wrap font-sans">
              {aiSummary}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">No AI summary drafted yet</h4>
              <p className="text-xs text-gray-500 leading-normal">
                Instruct our server-side Gemini 3.5 engine to synthesize an instant, bulleted executive highlights brief.
              </p>
            </div>
          </div>
          <button
            onClick={triggerDynamicAiSummary}
            disabled={aiLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center space-x-1.5 shrink-0"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate summary</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mobile Collapsible Table of Contents */}
      {headings.length > 0 && (
        <div id="mobile-toc-container" className="block lg:hidden bg-slate-50 border border-slate-100 rounded-3xl p-4 space-y-2">
          <button
            id="mobile-toc-toggle"
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full flex items-center justify-between font-sans font-bold text-xs text-gray-800 uppercase tracking-wide focus:outline-none"
          >
            <div className="flex items-center space-x-2">
              <ListTree className="w-4 h-4 text-indigo-600" />
              <span>Table of Contents ({headings.length})</span>
            </div>
            {mobileTocOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {mobileTocOpen && (
            <div id="mobile-toc-links" className="pt-2 pl-6 space-y-2 border-t border-slate-200 mt-2 text-xs">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    handleHeadingClick(e, heading.id);
                    setMobileTocOpen(false);
                  }}
                  className={`block py-1 hover:text-indigo-600 transition-colors ${
                    activeId === heading.id 
                      ? 'text-indigo-600 font-bold' 
                      : 'text-gray-500 font-medium'
                  } ${heading.level === 'h3' ? 'pl-3 border-l border-gray-150' : ''}`}
                >
                  {heading.text}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Core Article Body Prose */}
      <article className={`prose max-w-none text-gray-800 font-sans space-y-5 ${fontSizeClasses[fontSize].body}`}>
        {article.content.split('\n\n').map((paragraph, index) => {
          // Rudimentary Markdown Headings parser
          if (paragraph.startsWith('### ')) {
            const text = paragraph.replace('### ', '').trim();
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${index}`;
            return (
              <h3 key={index} id={id} className={fontSizeClasses[fontSize].h3}>
                {text}
              </h3>
            );
          }
          if (paragraph.startsWith('## ')) {
            const text = paragraph.replace('## ', '').trim();
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${index}`;
            return (
              <h2 key={index} id={id} className={fontSizeClasses[fontSize].h2}>
                {text}
              </h2>
            );
          }
          // Markdown list parser
          if (paragraph.startsWith('- ')) {
            return (
              <ul key={index} className={fontSizeClasses[fontSize].list}>
                {paragraph.split('\n').map((item, i) => (
                  <li key={i}>{item.replace('- ', '')}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          );
        })}
      </article>

      {/* Share and Likes Interactivity rows */}
      <div className="border-y border-gray-100 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none ${
              hasLiked
                ? 'bg-rose-50 text-rose-500 border border-rose-100'
                : 'bg-gray-50 border border-gray-150 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 text-gray-500'
            }`}
          >
            <Heart className={`w-4 h-4 shrink-0 ${hasLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
            <span>{likesCount} Likes</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 border border-gray-150 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 text-gray-500 transition-all focus:outline-none"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share Link</span>
          </button>

          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none border ${
                bookmarks.includes(article.id)
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  : 'bg-gray-50 border-gray-150 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 text-gray-500'
              }`}
            >
              <Bookmark className={`w-4 h-4 shrink-0 ${bookmarks.includes(article.id) ? 'fill-indigo-600 stroke-indigo-600' : ''}`} />
              <span>{bookmarks.includes(article.id) ? 'Bookmarked' : 'Save Bookmark'}</span>
            </button>
          )}
        </div>

        {shareSuccess && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Copied to clipboard!</span>
          </span>
        )}
      </div>

      {/* About the Author Card */}
      <div id="about-the-author-card" className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <h4 className="text-[10px] uppercase font-mono font-black tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Author Profile
          </h4>
          <span className="text-[10px] font-mono font-medium text-gray-400">
            Nexus Network
          </span>
        </div>

        {loadingAuthor ? (
          <div className="flex items-center space-x-3 py-4 text-gray-400 font-mono text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading author dossier...</span>
          </div>
        ) : authorProfile ? (
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group shrink-0">
              <img
                src={article.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt={authorProfile.displayName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover bg-gray-100 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-full border border-indigo-100 pointer-events-none" />
            </div>

            <div className="space-y-2.5 flex-1">
              <div>
                <button
                  onClick={() => onAuthorClick && onAuthorClick(article.authorId || authorProfile.displayName, authorProfile.displayName)}
                  className="font-sans font-black text-lg text-gray-900 hover:text-indigo-600 transition-colors text-left focus:outline-none"
                >
                  {authorProfile.displayName}
                </button>
                <p className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-wider mt-0.5">
                  {authorProfile.role}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                {authorProfile.bio || 'Specialist contributor at Nexus, focusing on modern frameworks, system integrations, and secure developer workflows.'}
              </p>

              {/* Social Links and Contact buttons */}
              <div className="flex items-center gap-2 pt-1.5">
                {authorProfile.socialLinks?.github && (
                  <a
                    href={authorProfile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-xs"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {authorProfile.socialLinks?.twitter && (
                  <a
                    href={authorProfile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-xs"
                    title="Twitter/X Profile"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {authorProfile.socialLinks?.linkedin && (
                  <a
                    href={authorProfile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-xs"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {authorProfile.socialLinks?.website && (
                  <a
                    href={authorProfile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-xs"
                    title="Personal Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {authorProfile.email && (
                  <a
                    href={`mailto:${authorProfile.email}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-xs"
                    title={`Email ${authorProfile.displayName}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}

                {onAuthorClick && (
                  <button
                    onClick={() => onAuthorClick(article.authorId || authorProfile.displayName, authorProfile.displayName)}
                    className="ml-auto text-[10px] font-mono font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">Could not fetch author profile information.</div>
        )}
      </div>

      {/* Transactional Commenting section */}
      <CommentSection
        articleId={article.id}
        userRole={userRole}
        activeEmail={activeEmail}
      />

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div id="related-articles-section" className="border-t border-gray-100 pt-10 mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-xl text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>Related Articles</span>
            </h3>
            {article.tags && article.tags.length > 0 && (
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                By primary tag: {article.tags[0]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedArticles.map((art) => (
              <div 
                id={`related-art-card-${art.id}`}
                key={art.id}
                onClick={() => onArticleSelect && onArticleSelect(art)}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col h-full text-left"
              >
                {/* Image header */}
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img 
                    src={art.featuredImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"} 
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350 ease-out"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                    <span className="text-[9px] font-mono font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    {art.tags && art.tags.length > 0 && (
                      <span className="text-[9px] font-mono font-bold uppercase bg-indigo-600/90 text-white backdrop-blur-xs px-2 py-0.5 rounded">
                        {art.tags[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="font-sans font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-[10px] text-gray-400 font-mono">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{art.readTime || '3 min read'}</span>
                    </div>
                    <span className="truncate max-w-[100px] text-right">By {art.authorName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        </div>

        {/* Right Column: Table of Contents Sidebar */}
        {headings.length > 0 && (
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 hidden lg:block">
            <div id="desktop-toc-container" className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <ListTree className="w-4 h-4 text-indigo-600" />
                <h4 className="font-sans font-black text-xs uppercase tracking-wider text-gray-950">
                  On this page
                </h4>
              </div>
              <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => handleHeadingClick(e, heading.id)}
                    className={`block py-1.5 text-xs transition-all hover:text-indigo-600 relative pl-4 ${
                      heading.level === 'h3' 
                        ? 'ml-3 border-l border-gray-100 text-gray-500 font-medium' 
                        : 'font-semibold'
                    } ${
                      activeId === heading.id 
                        ? 'text-indigo-600 font-bold' 
                        : 'text-gray-400'
                    }`}
                  >
                    {activeId === heading.id && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_4px_rgba(99,102,241,0.5)]" />
                    )}
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
