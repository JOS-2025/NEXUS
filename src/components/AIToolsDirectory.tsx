import React from 'react';
import { Star, ExternalLink, Sparkles, MessageSquare, AlertCircle, CheckCircle, ArrowRightLeft, MessageSquarePlus, User } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AITool } from '../types';
import AIToolDetailsModal from './AIToolDetailsModal';

interface AIToolsDirectoryProps {
  userRole: string;
  initialSelectedToolId?: string;
  onClearInitialSelectedToolId?: () => void;
}

export default function AIToolsDirectory({ userRole, initialSelectedToolId, onClearInitialSelectedToolId }: AIToolsDirectoryProps) {
  const [tools, setTools] = React.useState<AITool[]>([]);
  const [selectedTool, setSelectedTool] = React.useState<AITool | null>(null);
  const [category, setCategory] = React.useState('All');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Review submission state
  const [activeReviewToolId, setActiveReviewToolId] = React.useState<string | null>(null);
  const [reviewerName, setReviewerName] = React.useState('');
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewContent, setReviewContent] = React.useState('');
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [reviewSuccess, setReviewSuccess] = React.useState(false);

  // Load tools from API
  const fetchTools = async () => {
    try {
      const res = await fetch('/api/ai-tools');
      if (!res.ok) throw new Error('Failed to load tools');
      const data = await res.json();
      setTools(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTools();
  }, []);

  // Sync initialSelectedToolId if present
  React.useEffect(() => {
    if (initialSelectedToolId && tools.length > 0) {
      const tool = tools.find(t => t.id === initialSelectedToolId);
      if (tool) {
        setSelectedTool(tool);
        onClearInitialSelectedToolId?.();
      }
    }
  }, [initialSelectedToolId, tools]);

  // Sync selectedTool with updated tool list when reviews are submitted
  React.useEffect(() => {
    if (selectedTool) {
      const updated = tools.find(t => t.id === selectedTool.id);
      if (updated) {
        setSelectedTool(updated);
      }
    }
  }, [tools]);

  const handleModalReviewSubmit = async (e: React.FormEvent, reviewerName: string, reviewRating: number, reviewContent: string) => {
    if (!selectedTool) return false;
    try {
      const res = await fetch(`/api/ai-tools/${selectedTool.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: reviewerName,
          rating: reviewRating,
          content: reviewContent
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      
      // Reload tools to trigger rating update and reviews list update
      await fetchTools();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error saving review');
      return false;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, toolId: string) => {
    e.preventDefault();
    if (!reviewerName || !reviewContent) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/ai-tools/${toolId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: reviewerName,
          rating: reviewRating,
          content: reviewContent
        }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      
      setReviewSuccess(true);
      setReviewerName('');
      setReviewContent('');
      setReviewRating(5);
      
      // Reload tools to update ratings & review list
      await fetchTools();
      
      setTimeout(() => {
        setReviewSuccess(false);
        setActiveReviewToolId(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Error saving review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const categories = ['All', 'Productivity', 'Artificial Intelligence', 'Entrepreneurship'];

  const filteredTools = category === 'All'
    ? tools
    : tools.filter(t => t.category.toLowerCase() === category.toLowerCase());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Retrieving intelligence directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Directory Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Software Directory</span>
        </div>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Next-Gen AI Tools Directory
        </h1>
        <p className="font-sans text-sm text-gray-500">
          Compare pricing models, read authentic reviews, explore alternative frameworks, and access premium affiliates.
        </p>
      </div>

      {/* Directory Filters */}
      <div className="flex justify-center flex-wrap gap-2 border-b border-gray-100 pb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            id={`ai-tool-card-${tool.id}`}
            onClick={() => setSelectedTool(tool)}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 hover:scale-[1.01] transition-all flex flex-col justify-between cursor-pointer group text-left"
          >
            <div>
              {/* Tool Header Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={tool.logoUrl}
                    alt={tool.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover bg-gray-50 border border-gray-100"
                  />
                  <div>
                    <h3 className="font-sans font-bold text-lg text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{tool.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {tool.pricingType}
                      </span>
                      <span className="text-xs text-indigo-600 font-semibold">{tool.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-100/50">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500 mr-1 shrink-0" />
                  <span>{tool.rating}</span>
                </div>
              </div>

              {/* Description */}
              <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">{tool.description}</p>

              {/* Features Lists */}
              <div className="space-y-1.5 mb-5">
                <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                  Core Features
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tool.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-50 border border-slate-100/80 text-slate-600 px-2.5 py-0.5 rounded-lg"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alternatives row */}
              <div className="flex items-center space-x-1.5 bg-indigo-50/30 border border-indigo-100/50 rounded-xl px-3.5 py-2 mb-5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-[11px] font-semibold text-indigo-700 shrink-0">Alternatives:</span>
                <div className="flex flex-wrap gap-1.5 overflow-hidden">
                  {tool.alternatives.map((alt, idx) => (
                    <span key={idx} className="text-xs font-medium text-gray-500">
                      {alt}
                      {idx < tool.alternatives.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action footer */}
            <div className="border-t border-gray-50 pt-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveReviewToolId(activeReviewToolId === tool.id ? null : tool.id);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-indigo-600 flex items-center space-x-1 focus:outline-none cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reviews ({tool.reviews.length})</span>
                </button>

                <div className="flex items-center space-x-3.5">
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Full Matrix</span>
                    <span>→</span>
                  </span>

                  <a
                    href={tool.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-indigo-600 hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Reviews Panel */}
              {activeReviewToolId === tool.id && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-4 text-left animate-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-xs font-bold text-slate-700">User Reviews</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Total: {tool.reviews.length}</span>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {tool.reviews.map((rev, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                              {rev.author.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{rev.author}</span>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 stroke-amber-400'
                                    : 'fill-slate-100 stroke-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{rev.content}</p>
                        <span className="text-[9px] text-slate-400 font-mono block text-right">{rev.date}</span>
                      </div>
                    ))}
                  </div>

                  {/* Write a review form */}
                  {userRole === 'anonymous' ? (
                    <div className="flex items-center space-x-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200/50 justify-center">
                      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-500 text-center">
                        Registered Readers or Admins only. Switch your role above to write a review.
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleReviewSubmit(e, tool.id)} className="border-t border-slate-200/60 pt-3 space-y-3">
                      <div className="flex items-center space-x-1 text-xs text-slate-700 font-bold">
                        <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Leave Your Review</span>
                      </div>

                      {reviewSuccess ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl p-3 flex items-center space-x-2 text-xs justify-center font-semibold">
                          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                          <span>Review saved successfully!</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="Your Name"
                              className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="flex items-center space-x-1.5 justify-end">
                              <span className="text-[11px] text-slate-500 font-semibold shrink-0">Rating:</span>
                              <select
                                value={reviewRating}
                                onChange={(e) => setReviewRating(Number(e.target.value))}
                                className="bg-white border border-slate-200 text-xs rounded-lg px-1.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                {[5, 4, 3, 2, 1].map((n) => (
                                  <option key={n} value={n}>
                                    {n} Stars
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <textarea
                            required
                            rows={2}
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="Share your experience using this AI Tool..."
                            className="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />

                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {submittingReview ? 'Saving Review...' : 'Submit Review'}
                          </button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTool && (
          <AIToolDetailsModal
            tool={selectedTool}
            onClose={() => setSelectedTool(null)}
            userRole={userRole}
            onReviewSubmit={handleModalReviewSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
