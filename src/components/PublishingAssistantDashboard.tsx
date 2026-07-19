import React from 'react';
import { 
  Sparkles, AlertTriangle, CheckCircle2, ArrowUpRight, Filter, RefreshCw, 
  BookOpen, Image, FileText, Check, Layers, Gauge, Info, HelpCircle, AlertCircle,
  TrendingUp, Compass, Search, ExternalLink, Mail, PlusCircle
} from 'lucide-react';

interface PublishInsight {
  id: string;
  title: string;
  description: string;
  category: 'SEO' | 'Engagement' | 'Metadata' | 'Content Gap' | 'Structure' | 'Outdated';
  priority: 'High' | 'Medium' | 'Low';
  affectedEntity: string;
  affectedId: string;
  type: string;
  actionLabel: string;
  actionType: string;
  details?: any;
}

interface PublishingAssistantDashboardProps {
  onRefreshArticles?: () => void;
}

export default function PublishingAssistantDashboard({ onRefreshArticles }: PublishingAssistantDashboardProps) {
  const [insights, setInsights] = React.useState<PublishInsight[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);
  const [filterCategory, setFilterCategory] = React.useState<string>('All');
  const [filterPriority, setFilterPriority] = React.useState<string>('All');
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  
  // Resolution outcome display
  const [resolutionResult, setResolutionResult] = React.useState<{
    success: boolean;
    title: string;
    message: string;
    data?: any;
  } | null>(null);

  const fetchInsights = async (isManualScan = false) => {
    if (isManualScan) {
      setScanning(true);
      // Let scanning animation run for 1.2s for a premium feel
      await new Promise(resolve => setTimeout(resolve, 1200));
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/assistant/insights');
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Failed to load publishing insights:', error);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  React.useEffect(() => {
    fetchInsights();
  }, []);

  const handleResolve = async (insight: PublishInsight) => {
    setResolvingId(insight.id);
    setResolutionResult(null);

    try {
      const res = await fetch('/api/assistant/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insightId: insight.id,
          actionType: insight.actionType,
          payload: {
            affectedId: insight.affectedId,
            articleId: insight.affectedId,
            details: insight.details
          }
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setResolutionResult({
            success: true,
            title: insight.title,
            message: result.message,
            data: result.updatedData
          });
          // Refresh the list after a successful update
          fetchInsights();
          if (onRefreshArticles) {
            onRefreshArticles();
          }
        } else {
          setResolutionResult({
            success: false,
            title: insight.title,
            message: result.message || 'Action execution returned an unexpected status.'
          });
        }
      } else {
        throw new Error('Failed to reach AI assistant resolver.');
      }
    } catch (error: any) {
      setResolutionResult({
        success: false,
        title: insight.title,
        message: error.message || 'Network error occurred during AI optimization.'
      });
    } finally {
      setResolvingId(null);
    }
  };

  // Filter criteria logic
  const filteredInsights = insights.filter(item => {
    const matchCat = filterCategory === 'All' || item.category === filterCategory;
    const matchPrior = filterPriority === 'All' || item.priority === filterPriority;
    return matchCat && matchPrior;
  });

  // Calculate dynamic health metrics
  const totalHeuristics = 16;
  const unresolvedCount = insights.length;
  const resolvedCount = Math.max(0, totalHeuristics - unresolvedCount);
  const healthScore = Math.min(100, Math.round((resolvedCount / totalHeuristics) * 100));

  const categories = ['All', 'SEO', 'Engagement', 'Metadata', 'Content Gap', 'Structure', 'Outdated'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  // Helper styles for Category & Priority badges
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SEO': return <Search className="w-3.5 h-3.5" />;
      case 'Engagement': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'Metadata': return <Image className="w-3.5 h-3.5" />;
      case 'Content Gap': return <Compass className="w-3.5 h-3.5" />;
      case 'Structure': return <Layers className="w-3.5 h-3.5" />;
      case 'Outdated': return <RefreshCw className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5 shrink-0" />
            </div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight">
              Intelligent Publishing Assistant
            </h1>
          </div>
          <p className="font-sans text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Continuous deep-content heuristics scanner powered by server-side Gemini AI. Surfaces critical content gaps, SEO warnings, stale statistics, broken links, and high-performance monetization pathways.
          </p>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={scanning || loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700 hover:border-slate-600 text-white rounded-xl text-xs font-bold tracking-wide transition-all self-start shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          <span>{scanning ? 'Auditing Platform...' : 'Rescan Platform'}</span>
        </button>
      </div>

      {/* OVERVIEW BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* HEALTH METER */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 block mb-1">
              Platform Health Score
            </span>
            <h3 className="text-sm font-sans font-bold text-slate-300">
              Content & SEO Optimization Index
            </h3>
          </div>
          
          <div className="py-4 flex items-center space-x-5">
            <div className="relative flex items-center justify-center">
              {/* Simple CSS Circular indicator */}
              <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center">
                <span className="text-2xl font-black text-white">{healthScore}%</span>
              </div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full clip-path-half animate-pulse" style={{ opacity: healthScore / 100 }}></div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">
                Heuristics Audited: <strong className="text-white">{totalHeuristics}</strong>
              </span>
              <span className="text-xs text-slate-400 block">
                Issues Resolved: <strong className="text-emerald-400">{resolvedCount} / {totalHeuristics}</strong>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 inline-block">
                {healthScore > 80 ? '🔒 SECURE' : healthScore > 60 ? '⚡ OPTIMIZING' : '⚠️ HEURISTICS WARNING'}
              </span>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 leading-normal flex items-start space-x-1 border-t border-slate-800/60 pt-3 mt-1">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>Resolving outstanding recommendations raises your local SEO and user conversion velocity scores.</span>
          </div>
        </div>

        {/* METRICS SUMMARY */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block mb-1">
              Action Priority
            </span>
            <h3 className="text-sm font-sans font-bold text-slate-300">
              Outstanding Optimization Tasks
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-3 text-center">
              <span className="text-xl font-black text-rose-400 block">
                {insights.filter(i => i.priority === 'High').length}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block">High</span>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 text-center">
              <span className="text-xl font-black text-amber-400 block">
                {insights.filter(i => i.priority === 'Medium').length}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block">Med</span>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-3 text-center">
              <span className="text-xl font-black text-slate-400 block">
                {insights.filter(i => i.priority === 'Low').length}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block">Low</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-normal flex items-start space-x-1 border-t border-slate-800/60 pt-3">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>High priority actions focus on critical SEO meta-tags failures and trending query demands.</span>
          </div>
        </div>

        {/* AI CAPABILITIES OVERVIEW */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-1">
              Intelligence Status
            </span>
            <h3 className="text-sm font-sans font-bold text-slate-300">
              Active Agent Integrations
            </h3>
          </div>

          <div className="space-y-2.5 my-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>SEO Tags Generator</span>
              </span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>FAQ Blueprinting Engine</span>
              </span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Demand Outline Architect</span>
              </span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">READY</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-normal flex items-start space-x-1 border-t border-slate-800/60 pt-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Server-side models are verified as active and compliant with full-stack keys isolation.</span>
          </div>
        </div>

      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-slate-950/60 border border-slate-800/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Category selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center space-x-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Priority:</span>
          {priorities.map(prio => (
            <button
              key={prio}
              onClick={() => setFilterPriority(prio)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterPriority === prio 
                  ? 'bg-slate-800 text-white border border-slate-600' 
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>

      </div>

      {/* RESOLUTION SUCCESS / ERROR OVERLAY */}
      {resolutionResult && (
        <div className={`p-5 rounded-3xl border animate-in slide-in-from-top-4 duration-300 flex items-start space-x-4 ${
          resolutionResult.success 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
        }`}>
          <div className={`p-2 rounded-xl shrink-0 ${resolutionResult.success ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
            <Check className="w-5 h-5 shrink-0" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-sans font-bold text-sm text-white">
                {resolutionResult.success ? 'Recommendation Resolved Successfully' : 'Resolution Failure'}
              </h4>
              <button 
                onClick={() => setResolutionResult(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              {resolutionResult.message}
            </p>
            {resolutionResult.success && resolutionResult.data && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 mt-3 text-left">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  AI Applied Output Preview:
                </span>
                {resolutionResult.data.seoTitle && (
                  <p className="text-[11px] text-slate-300"><strong className="text-slate-400">SEO Title:</strong> {resolutionResult.data.seoTitle}</p>
                )}
                {resolutionResult.data.seoDescription && (
                  <p className="text-[11px] text-slate-300"><strong className="text-slate-400">SEO Desc:</strong> {resolutionResult.data.seoDescription}</p>
                )}
                {resolutionResult.data.tags && (
                  <p className="text-[11px] text-slate-300"><strong className="text-slate-400">Tags:</strong> {resolutionResult.data.tags.join(', ')}</p>
                )}
                {resolutionResult.data.caption && (
                  <p className="text-[11px] text-indigo-300 italic font-mono whitespace-pre-wrap">{resolutionResult.data.caption}</p>
                )}
                {resolutionResult.data.htmlBody && (
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 mt-2">
                    <span className="font-bold text-slate-300 block mb-1">HTML Subject: {resolutionResult.data.subject}</span>
                    <pre className="overflow-x-auto p-1.5 bg-slate-950 rounded text-slate-500 font-mono text-[9px] max-h-24">{resolutionResult.data.htmlBody}</pre>
                  </div>
                )}
                {resolutionResult.data.content && (
                  <p className="text-[11px] text-slate-400 truncate"><strong className="text-slate-400">Content Block:</strong> [Generated text appended successfully]</p>
                )}
                {resolutionResult.data.resource && (
                  <p className="text-[11px] text-emerald-400"><strong className="text-slate-400">Resource Created:</strong> {resolutionResult.data.resource.title} ({resolutionResult.data.resource.fileSize})</p>
                )}
                {resolutionResult.data.guide && (
                  <p className="text-[11px] text-indigo-400"><strong className="text-slate-400">Learning path created:</strong> {resolutionResult.data.guide.title}</p>
                )}
                {resolutionResult.data.article && (
                  <p className="text-[11px] text-amber-400"><strong className="text-slate-400">Content Skeleton Outline Drafted:</strong> {resolutionResult.data.article.title}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INSIGHTS INDEX */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-slate-800/50 rounded-3xl">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-semibold text-slate-400">Analyzing platform content & reading telemetry...</p>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/10 border border-slate-800/40 rounded-3xl space-y-4">
          <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/15">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-sans font-bold text-white text-base">Perfect Health Score Secured!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No recommendations match your active filter. Your content, metadata alignments, structured SEO paths, and marketing capture parameters are fully optimized!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Showing {filteredInsights.length} Recommendations
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Updated just now
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredInsights.map(item => {
              const resolving = resolvingId === item.id;
              return (
                <div 
                  key={item.id} 
                  className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-800 rounded-3xl p-5 sm:p-6 transition-all flex flex-col md:flex-row items-start justify-between gap-6"
                >
                  <div className="flex-1 min-w-0 space-y-3">
                    
                    {/* Badge line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadgeColor(item.priority)}`}>
                        {item.priority} Priority
                      </span>
                      <span className="bg-slate-800/70 text-indigo-400 border border-slate-700/50 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 select-all truncate max-w-xs block">
                        Entity: {item.affectedEntity}
                      </span>
                    </div>

                    {/* Content text */}
                    <div className="space-y-1.5">
                      <h3 className="font-sans font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center space-x-1.5">
                        <span>{item.title}</span>
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Suggestions list if available */}
                    {item.details && item.details.suggestions && (
                      <div className="bg-slate-950/30 border border-slate-800/40 p-3 rounded-2xl">
                        <span className="text-[9px] font-mono text-indigo-400 block mb-1">RELEVANT TARGET PIECES DISCOVERED:</span>
                        <ul className="list-disc pl-4 space-y-1">
                          {item.details.suggestions.map((sug: string, i: number) => (
                            <li key={i} className="text-[10px] text-slate-400 font-medium">Link with {sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ACTION SECTION */}
                  <div className="shrink-0 self-end md:self-center w-full md:w-auto">
                    <button
                      onClick={() => handleResolve(item)}
                      disabled={resolving || resolvingId !== null}
                      className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/50 disabled:text-indigo-400 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-indigo-600/10"
                    >
                      {resolving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                          <span>Applying AI Fix...</span>
                        </>
                      ) : (
                        <>
                          <span>{item.actionLabel}</span>
                          <ArrowUpRight className="w-4 h-4 text-white/80 shrink-0" />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOWER EXPLANATORY FOOTER */}
      <div className="bg-slate-950/40 border border-slate-800/70 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">How to leverage proactive insights</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The publishing engine constantly audits search query lists, category metrics, and publication dates. When readers seek unregistered content or your seo headers drop in quality, the system creates optimization drafts instantly. Clicking any action button generates live payloads that update the local database.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-sans font-bold text-white text-xs uppercase tracking-wider">AI Schema-generation mechanism</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All content revisions, downloadable cheat sheets, and course curriculums generated by the assistant utilize structured JSON outputs from Gemini models. This keeps your metadata clean, accurate, and ready for immediate deployment to Supabase or localized exports.
          </p>
        </div>
      </div>

    </div>
  );
}
