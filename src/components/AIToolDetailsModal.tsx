import React from 'react';
import { motion } from 'motion/react';
import { X, Star, ThumbsUp, ThumbsDown, ExternalLink, ArrowRightLeft, Sparkles, MessageSquare, Calendar, User, ShieldCheck } from 'lucide-react';
import { AITool } from '../types';

interface AIToolDetailsModalProps {
  tool: AITool;
  onClose: () => void;
  userRole: string;
  onReviewSubmit: (e: React.FormEvent, reviewerName: string, reviewRating: number, reviewContent: string) => Promise<boolean>;
}

export default function AIToolDetailsModal({ tool, onClose, userRole, onReviewSubmit }: AIToolDetailsModalProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'reviews'>('overview');
  const [activeScreenshot, setActiveScreenshot] = React.useState<string>(tool.screenshots?.[0] || '');
  
  // Local review form state
  const [reviewerName, setReviewerName] = React.useState('');
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewContent, setReviewContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const defaultPros = [
    "Clean interface with responsive web elements",
    "Comprehensive feature set mapping standard developer tasks",
    "Substantial timesaves noted by active early testers",
    "Direct compatibility with modern cloud native ecosystems"
  ];

  const defaultCons = [
    "Steep initial learning curve for custom system integrations",
    "Muted offline-first features",
    "Relatively high operational overhead on smaller servers"
  ];

  const pros = tool.pros && tool.pros.length > 0 ? tool.pros : defaultPros;
  const cons = tool.cons && tool.cons.length > 0 ? tool.cons : defaultCons;
  const screenshots = tool.screenshots && tool.screenshots.length > 0 ? tool.screenshots : [
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"
  ];

  React.useEffect(() => {
    if (screenshots.length > 0) {
      setActiveScreenshot(screenshots[0]);
    }
  }, [tool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewContent) return;
    setIsSubmitting(true);
    const ok = await onReviewSubmit(e, reviewerName, reviewRating, reviewContent);
    setIsSubmitting(false);
    if (ok) {
      setSuccess(true);
      setReviewerName('');
      setReviewContent('');
      setReviewRating(5);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs cursor-zoom-out"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative bg-white border border-gray-100 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10 text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-gray-100 transition-all z-20 cursor-pointer"
          id="close-tool-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Row */}
        <div className="p-6 sm:p-8 bg-linear-to-b from-indigo-50/20 to-transparent border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={tool.logoUrl}
              alt={tool.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border border-gray-100 bg-gray-50 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100/30">
                  {tool.category}
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                  {tool.pricingType}
                </span>
              </div>
              <h2 className="font-sans font-black text-2xl text-gray-900 tracking-tight leading-none">
                {tool.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center self-start sm:self-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-2xl text-sm font-black border border-amber-100/50">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500 mr-1 shrink-0" />
                <span>{tool.rating} / 5.0</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-400 mt-1 uppercase">
                {tool.reviews.length} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-gray-100 px-6 sm:px-8 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-sans font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview & Matrix
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 font-sans font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>User Reviews</span>
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black">
              {tool.reviews.length}
            </span>
          </button>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          {activeTab === 'overview' ? (
            <div className="space-y-8">
              {/* Description Block */}
              <div className="space-y-3">
                <h3 className="font-sans font-bold text-base text-gray-900">About the Platform</h3>
                <p className="font-sans text-sm text-gray-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Affiliate & Link Card */}
              <div className="p-5 bg-indigo-50/40 border border-indigo-100/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-left">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-gray-900">Official Partner Affiliate</h4>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">Access direct discount paths and priority sandbox queues.</p>
                  </div>
                </div>
                <a
                  href={tool.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-5 py-3 bg-indigo-600 text-white font-sans font-bold text-xs rounded-2xl shadow-md shadow-indigo-100 hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <span>Visit Platform</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Screenshots Gallery Section */}
              {screenshots.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-sans font-bold text-base text-gray-900">Platform Screenshots</h3>
                  <div className="space-y-3">
                    <div className="aspect-video w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-inner">
                      <img
                        src={activeScreenshot}
                        alt={`${tool.name} detail view`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {screenshots.length > 1 && (
                      <div className="flex gap-2">
                        {screenshots.map((screen, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveScreenshot(screen)}
                            className={`w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all bg-gray-50 cursor-pointer ${
                              activeScreenshot === screen
                                ? 'border-indigo-600 opacity-100 shadow-xs'
                                : 'border-gray-150 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={screen} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Review Matrix (Pros & Cons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros Block */}
                <div className="p-6 bg-emerald-50/20 border border-emerald-100/50 rounded-3xl space-y-4">
                  <h4 className="font-sans font-bold text-sm text-emerald-800 flex items-center space-x-1.5">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span>Pros / High Points</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {pros.map((p, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-600 leading-relaxed font-sans">
                        <span className="mr-2 text-emerald-500 select-none">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons Block */}
                <div className="p-6 bg-rose-50/20 border border-rose-100/50 rounded-3xl space-y-4">
                  <h4 className="font-sans font-bold text-sm text-rose-800 flex items-center space-x-1.5">
                    <ThumbsDown className="w-4 h-4 text-rose-600" />
                    <span>Cons / Trade-offs</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {cons.map((c, idx) => (
                      <li key={idx} className="flex items-start text-xs text-gray-600 leading-relaxed font-sans">
                        <span className="mr-2 text-rose-400 select-none">✗</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Core Features list */}
              <div className="space-y-3">
                <h3 className="font-sans font-bold text-base text-gray-900">Featured Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-gray-50 border border-gray-100 text-gray-600 px-3.5 py-1 rounded-xl"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alternatives comparison */}
              <div className="p-5 bg-slate-50 border border-slate-100/80 rounded-3xl space-y-3">
                <div className="flex items-center space-x-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                  <h4 className="font-sans font-bold text-sm text-slate-800">Direct Industry Alternatives</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tool.alternatives.map((alt, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono font-medium text-slate-600 bg-white border border-slate-200/50 px-3 py-1 rounded-lg"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-sans text-gray-400 mt-1 leading-normal">
                  Our editors periodically test these tools against {tool.name} to measure interface responsiveness and response latency.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Existing Reviews list */}
              <div className="space-y-4">
                <h3 className="font-sans font-bold text-base text-gray-900">What readers are saying</h3>
                {tool.reviews.length === 0 ? (
                  <p className="text-sm font-sans text-gray-400 py-4">No reviews have been submitted for this platform yet. Be the first!</p>
                ) : (
                  <div className="space-y-3">
                    {tool.reviews.map((rev, idx) => (
                      <div key={idx} className="bg-white p-5 border border-gray-100 rounded-3xl space-y-2 shadow-xs text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-800 block">{rev.author}</span>
                              <span className="text-[10px] text-gray-400 font-mono flex items-center space-x-1">
                                <Calendar className="w-3 h-3 mr-0.5" />
                                <span>{rev.date}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-xl text-[11px] font-bold text-amber-800 border border-amber-100/50">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-500 mr-1 shrink-0" />
                            <span>{rev.rating}.0</span>
                          </div>
                        </div>
                        <p className="font-sans text-xs text-gray-600 leading-relaxed pt-1">
                          {rev.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit a review panel */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="font-sans font-bold text-base text-gray-900">Write an Expert Review</h3>
                {userRole === 'anonymous' ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-center space-x-2">
                    <p className="text-xs text-slate-500 font-sans">
                      Anonymous browsing session active. Toggle your membership role in the page header to unlock reviews submission.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {success ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-sans font-semibold text-center">
                        ✓ Thank you! Your authentic review has been saved and factored into the global rating.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold font-mono text-gray-500 uppercase tracking-wider">Your Name</label>
                            <input
                              type="text"
                              required
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="e.g. Liam Sterling"
                              className="w-full bg-gray-50 border border-gray-100 text-xs rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold font-mono text-gray-500 uppercase tracking-wider">Rating</label>
                            <select
                              value={reviewRating}
                              onChange={(e) => setReviewRating(Number(e.target.value))}
                              className="w-full bg-gray-50 border border-gray-100 text-xs rounded-xl px-3 py-3 text-gray-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                              {[5, 4, 3, 2, 1].map((stars) => (
                                <option key={stars} value={stars}>{stars} Stars</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold font-mono text-gray-500 uppercase tracking-wider font-semibold">Your Review</label>
                          <textarea
                            required
                            rows={3}
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            placeholder="Share your practical developer insights, pros/cons, and ease of deployment..."
                            className="w-full bg-gray-50 border border-gray-100 text-xs rounded-xl p-4 text-gray-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer"
                        >
                          {isSubmitting ? "Submitting Review..." : "Submit Review"}
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
