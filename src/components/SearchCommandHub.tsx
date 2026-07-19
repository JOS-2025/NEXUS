import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Newspaper, Sparkles, BookOpen, ExternalLink, Calendar, ArrowRight, CornerDownLeft, Star, Download, Flame, Clock } from 'lucide-react';
import { Article, AITool, Resource } from '../types';

interface SearchCommandHubProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  tools: AITool[];
  resources: Resource[];
  onSelectArticle: (article: Article) => void;
  onSelectTool: (tool: AITool) => void;
  onSelectResource: (resource: Resource) => void;
}

export default function SearchCommandHub({
  isOpen,
  onClose,
  articles,
  tools,
  resources,
  onSelectArticle,
  onSelectTool,
  onSelectResource
}: SearchCommandHubProps) {
  const [query, setQuery] = React.useState('');
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load recent searches on open
  React.useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('nexus_recent_searches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, 3));
          }
        } catch (e) {
          console.error('Failed to parse recent searches', e);
        }
      }
    }
  }, [isOpen]);

  const saveSearchQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    
    const saved = localStorage.getItem('nexus_recent_searches');
    let list: string[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        list = [];
      }
    }
    if (!Array.isArray(list)) list = [];

    const updated = [trimmed, ...list.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem('nexus_recent_searches', JSON.stringify(updated));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      saveSearchQuery(query.trim());
    }
  };

  const handleRecentClick = (sq: string) => {
    setQuery(sq);
    inputRef.current?.focus();
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('nexus_recent_searches');
  };

  // Focus input when hub opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery('');
    }
  }, [isOpen]);

  // Global escape key and shortcut handling
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Search computations
  const cleanQuery = query.trim().toLowerCase();

  const matchedArticles = cleanQuery
    ? articles.filter(art => 
        art.title.toLowerCase().includes(cleanQuery) ||
        art.summary.toLowerCase().includes(cleanQuery) ||
        art.tags.some(tag => tag.toLowerCase().includes(cleanQuery)) ||
        art.category.toLowerCase().includes(cleanQuery)
      ).slice(0, 5)
    : articles.slice(0, 3); // Show recent if empty

  const matchedTools = cleanQuery
    ? tools.filter(tool => 
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery) ||
        tool.category.toLowerCase().includes(cleanQuery) ||
        tool.features.some(f => f.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : tools.slice(0, 2);

  const matchedResources = cleanQuery
    ? resources.filter(res => 
        res.title.toLowerCase().includes(cleanQuery) ||
        res.description.toLowerCase().includes(cleanQuery) ||
        res.type.toLowerCase().includes(cleanQuery) ||
        res.author.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : resources.slice(0, 2);

  const totalResultsCount = 
    (cleanQuery ? matchedArticles.length : 0) + 
    (cleanQuery ? matchedTools.length : 0) + 
    (cleanQuery ? matchedResources.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-zoom-out"
      />

      {/* Hub Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[75vh] flex flex-col overflow-hidden z-10 text-left"
      >
        {/* Search Header Input bar */}
        <div className="flex items-center space-x-3 px-6 py-4.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search publications, AI tools, checklists, prompt packs..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-slate-150/50 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-100">
            <span>ESC</span>
          </div>
        </div>

        {/* Recent Searches Cache */}
        {recentSearches.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center flex-wrap gap-2 text-xs">
            <span className="font-mono text-[9px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Recent:</span>
            </span>
            {recentSearches.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleRecentClick(sq)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/60 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer font-sans font-semibold text-[10px] flex items-center gap-1 shrink-0"
              >
                <span>{sq}</span>
              </button>
            ))}
            <button 
              onClick={clearRecentSearches}
              className="ml-auto text-[9px] font-mono font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Results Stream Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {cleanQuery && totalResultsCount === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No matching telemetry found</p>
                <p className="text-xs text-slate-400 mt-1">Refine your tags, pricing modes, or author filters.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Category 1: Publications / Articles */}
              {matchedArticles.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Publications & Articles</span>
                    </span>
                    <span>{cleanQuery ? 'matches' : 'featured'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedArticles.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => {
                          if (query.trim()) saveSearchQuery(query.trim());
                          onSelectArticle(art);
                          onClose();
                        }}
                        className="w-full bg-slate-50/40 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100/80 p-3.5 rounded-2xl transition-all flex items-start gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 shrink-0 hidden sm:block">
                          <img src={art.featuredImage} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">
                              {art.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-0.5" />
                              {new Date(art.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-sans font-bold text-xs text-slate-800 mt-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {art.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {art.summary}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: AI Software Tools */}
              {matchedTools.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>AI software directory</span>
                    </span>
                    <span>{cleanQuery ? 'matches' : 'curated'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (query.trim()) saveSearchQuery(query.trim());
                          onSelectTool(tool);
                          onClose();
                        }}
                        className="w-full bg-slate-50/40 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100/80 p-3.5 rounded-2xl transition-all flex items-start gap-3 text-left group cursor-pointer"
                      >
                        <img
                          src={tool.logoUrl}
                          alt={tool.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans font-black text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {tool.name}
                            </h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                              {tool.pricingType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                            {tool.description}
                          </p>
                        </div>
                        <div className="flex items-center self-center gap-2 shrink-0">
                          <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-amber-100/50">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-500 mr-0.5 shrink-0" />
                            <span>{tool.rating}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Library Resources */}
              {matchedResources.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Library Downloads & Guides</span>
                    </span>
                    <span>{cleanQuery ? 'matches' : 'available'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedResources.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => {
                          if (query.trim()) saveSearchQuery(query.trim());
                          onSelectResource(res);
                          onClose();
                        }}
                        className="w-full bg-slate-50/40 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100/80 p-3.5 rounded-2xl transition-all flex items-start gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans font-black text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {res.title}
                            </h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                              {res.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                            {res.description}
                          </p>
                        </div>
                        <div className="flex items-center self-center gap-1.5 shrink-0 text-[10px] font-mono text-slate-400 font-semibold">
                          <span>{res.fileSize}</span>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Command Hub Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-[10px] font-bold font-mono text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>select</span>
            </span>
            <span>ESC to close</span>
          </div>
          {cleanQuery && (
            <div className="flex items-center gap-1 bg-indigo-50/50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100/30">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{totalResultsCount} elements synchronized</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
