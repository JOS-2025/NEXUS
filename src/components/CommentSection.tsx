import React from 'react';
import { 
  MessageSquare, Heart, CornerDownRight, Send, Loader2, Reply, 
  Trash2, AlertCircle, CheckCircle, Shield, User, Clock, ArrowRight
} from 'lucide-react';
import { Comment } from '../types';

interface CommentSectionProps {
  articleId: string;
  userRole: string;
  activeEmail: string;
}

export default function CommentSection({ articleId, userRole, activeEmail }: CommentSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'most_liked'>('newest');

  // New main comment states
  const [commentName, setCommentName] = React.useState('');
  const [commentText, setCommentText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Reply states
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyName, setReplyName] = React.useState('');
  const [replyText, setReplyText] = React.useState('');
  const [submittingReply, setSubmittingReply] = React.useState(false);

  // Auto-fill author name based on role or email
  React.useEffect(() => {
    if (activeEmail && activeEmail !== 'anonymous') {
      const parts = activeEmail.split('@')[0];
      const formatted = parts
        .split('.')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
      setCommentName(formatted);
      setReplyName(formatted);
    } else {
      setCommentName('');
      setReplyName('');
    }
  }, [activeEmail]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (!res.ok) throw new Error('Failed to retrieve community discussions.');
      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch comments.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: commentName || 'Anonymous Scholar',
          content: commentText,
          authorAvatar: activeEmail === 'sarah.chen@nexus.ai' 
            ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            : undefined
        })
      });

      if (!res.ok) throw new Error('Could not submit comment.');
      const newComment = await res.json();
      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (err: any) {
      alert(err.message || 'Error posting comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: replyName || 'Anonymous Scholar',
          content: replyText,
          parentId,
          authorAvatar: activeEmail === 'sarah.chen@nexus.ai' 
            ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            : undefined
        })
      });

      if (!res.ok) throw new Error('Could not submit reply.');
      const newReply = await res.json();
      setComments(prev => [...prev, newReply]);
      setReplyText('');
      setReplyingToId(null);
    } catch (err: any) {
      alert(err.message || 'Error posting reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      // Optimistic Update
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          const likedBy = c.likedBy || [];
          const likes = c.likes || 0;
          const isLiked = likedBy.includes(activeEmail);
          return {
            ...c,
            likes: isLiked ? Math.max(0, likes - 1) : likes + 1,
            likedBy: isLiked ? likedBy.filter(e => e !== activeEmail) : [...likedBy, activeEmail]
          };
        }
        return c;
      }));

      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail })
      });

      if (!res.ok) {
        // Rollback on error
        fetchComments();
      } else {
        const updated = await res.json();
        setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to moderate/delete this comment?')) return;
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        alert('Failed to delete comment.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Organize comments into parent & child structures and sort them accordingly
  const sortedParentComments = React.useMemo(() => {
    const parents = comments.filter(c => !c.parentId);
    return [...parents].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'most_liked') {
        const likesA = a.likes || 0;
        const likesB = b.likes || 0;
        if (likesB !== likesA) {
          return likesB - likesA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [comments, sortBy]);

  const getRepliesFor = (parentId: string) => comments.filter(c => c.parentId === parentId);

  // Helper for badge display based on common editorial roles
  const getRoleBadge = (commenterName: string) => {
    const nameLower = commenterName.toLowerCase();
    if (nameLower.includes('sarah chen') || nameLower.includes('chen')) {
      return (
        <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[9px] font-mono rounded font-bold text-indigo-700">
          <Shield className="w-2.5 h-2.5 fill-indigo-100" />
          <span>AUTHOR</span>
        </span>
      );
    }
    if (nameLower.includes('editor') || nameLower.includes('vance')) {
      return (
        <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-violet-50 border border-violet-100 text-[9px] font-mono rounded font-bold text-violet-700">
          <Shield className="w-2.5 h-2.5" />
          <span>STAFF EDITOR</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pt-4 text-left">
      
      {/* Title block with sorting dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600 shrink-0" />
          <h3 className="font-sans font-black text-sm uppercase tracking-wide text-gray-900">
            Reader Discussion ({comments.length})
          </h3>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 text-[11px] text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="font-medium shrink-0">Sort:</span>
            <select
              id="comments-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 text-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer text-xs"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_liked">Most Liked</option>
            </select>
          </div>
          <span className="font-medium">
            Logged in as: <span className="text-gray-700 font-bold">{activeEmail}</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center space-x-2 py-8 justify-center">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Loading conversation thread...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* List parent comments */}
          {sortedParentComments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-gray-100 rounded-3xl space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto stroke-1" />
              <p className="text-xs font-bold text-gray-400">Be the first to join the dialogue</p>
              <p className="text-[11px] text-gray-450 max-w-sm mx-auto">
                Share your perspective, professional feedback, or ask a clarifying question about these secure insights.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedParentComments.map(comment => {
                const replies = getRepliesFor(comment.id);
                const hasLiked = comment.likedBy?.includes(activeEmail);
                const isUserAdminOrEditor = userRole === 'admin' || userRole === 'editor';

                return (
                  <div key={comment.id} className="space-y-4">
                    
                    {/* Parent Comment Box */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xs hover:border-gray-200 transition-colors space-y-3">
                      
                      {/* Comment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={comment.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                            alt={comment.authorName}
                            className="w-8 h-8 rounded-full border border-gray-150 object-cover shrink-0" 
                          />
                          <div className="text-left space-y-0.5">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="font-bold text-xs text-gray-900 leading-none">{comment.authorName}</span>
                              {getRoleBadge(comment.authorName)}
                            </div>
                            <span className="text-[9px] text-gray-400 font-medium font-mono flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              <span>{new Date(comment.createdAt).toLocaleString()}</span>
                            </span>
                          </div>
                        </div>

                        {isUserAdminOrEditor && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Moderate Comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-xs text-gray-700 leading-relaxed font-sans pl-1">
                        {comment.content}
                      </p>

                      {/* Action items: Like & Reply button */}
                      <div className="flex items-center space-x-4 pt-1 border-t border-gray-50 text-[11px] pl-1">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`inline-flex items-center space-x-1 font-bold transition-colors ${
                            hasLiked ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : ''}`} />
                          <span>{comment.likes || 0}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (replyingToId === comment.id) {
                              setReplyingToId(null);
                            } else {
                              setReplyingToId(comment.id);
                              setReplyText('');
                            }
                          }}
                          className="inline-flex items-center space-x-1 font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>

                    </div>

                    {/* Replies Container nested list */}
                    {replies.length > 0 && (
                      <div className="pl-6 border-l-2 border-indigo-50/70 space-y-3 ml-4">
                        {replies.map(reply => {
                          const replyHasLiked = reply.likedBy?.includes(activeEmail);

                          return (
                            <div 
                              key={reply.id} 
                              className="bg-slate-50/55 hover:bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <img 
                                    src={reply.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                                    alt={reply.authorName}
                                    className="w-7 h-7 rounded-full border border-gray-150 object-cover shrink-0" 
                                  />
                                  <div className="text-left">
                                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                      <span className="font-bold text-xs text-gray-800 leading-none">{reply.authorName}</span>
                                      {getRoleBadge(reply.authorName)}
                                    </div>
                                    <span className="text-[8px] text-gray-400 font-mono flex items-center space-x-0.5">
                                      <Clock className="w-2 h-2" />
                                      <span>{new Date(reply.createdAt).toLocaleString()}</span>
                                    </span>
                                  </div>
                                </div>

                                {isUserAdminOrEditor && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="text-gray-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs text-gray-600 leading-relaxed font-sans pl-1">
                                {reply.content}
                              </p>

                              <div className="flex items-center space-x-3 pt-1 text-[10px] pl-1">
                                <button
                                  onClick={() => handleLike(reply.id)}
                                  className={`inline-flex items-center space-x-1 font-bold transition-colors ${
                                    replyHasLiked ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${replyHasLiked ? 'fill-rose-600' : ''}`} />
                                  <span>{reply.likes || 0}</span>
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Replying Inline Input Box */}
                    {replyingToId === comment.id && (
                      <div className="pl-6 ml-4 animate-in slide-in-from-top-1 duration-200">
                        <form 
                          onSubmit={(e) => handleReplySubmit(e, comment.id)} 
                          className="bg-slate-50 border border-indigo-50 rounded-2xl p-4 space-y-3 text-left"
                        >
                          <div className="flex items-center space-x-1 text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-600">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Replying to {comment.authorName}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              required
                              value={replyName}
                              onChange={(e) => setReplyName(e.target.value)}
                              placeholder="Name for reply"
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                            />
                          </div>

                          <div className="relative">
                            <textarea
                              required
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type professional reply..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
                            />
                            <button
                              type="submit"
                              disabled={submittingReply}
                              className="absolute bottom-2.5 right-2.5 p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {submittingReply ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* New Main Comment Section */}
          <form 
            onSubmit={handleCommentSubmit} 
            className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center space-x-1 text-xs text-indigo-900 font-black">
              <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
              <span className="uppercase tracking-wider">Add Your Perspective</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono uppercase tracking-wider font-bold text-gray-400">Author Name</label>
                <input
                  type="text"
                  required
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your professional name"
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[9px] font-mono uppercase tracking-wider font-bold text-gray-400">Comment Content</label>
              <div className="relative">
                <textarea
                  required
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share a secure, thoughtful insight or ask the author a question..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-normal"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors focus:outline-none disabled:opacity-50 shadow-md shadow-indigo-100"
                  title="Post Comment"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
