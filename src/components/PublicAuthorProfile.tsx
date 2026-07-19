import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, Twitter, Linkedin, Globe, Mail, BookOpen, Heart, Eye, Calendar, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Article } from '../types';

interface AuthorData {
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

interface PublicAuthorProfileProps {
  authorId?: string;
  authorName: string;
  onClose: () => void;
  onArticleClick: (article: Article) => void;
}

export default function PublicAuthorProfile({ authorId, authorName, onClose, onArticleClick }: PublicAuthorProfileProps) {
  const [author, setAuthor] = useState<AuthorData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuthorAndArticles() {
      setLoading(true);
      setError(null);
      try {
        // Fetch author profile
        // We try querying by authorId first, fallback to authorName
        const identifier = authorId || authorName;
        const profileRes = await fetch(`/api/authors/${encodeURIComponent(identifier)}`);
        if (!profileRes.ok) {
          throw new Error('Failed to retrieve author profile');
        }
        const profileData = await profileRes.json();
        setAuthor(profileData);

        // Fetch author's articles
        const articlesRes = await fetch(`/api/articles`);
        if (!articlesRes.ok) {
          throw new Error('Failed to retrieve articles');
        }
        const allArticles: Article[] = await articlesRes.json();
        
        // Filter articles by authorId or authorName match
        const authorArticles = allArticles.filter(art => {
          if (profileData.authorId && art.authorId === profileData.authorId) return true;
          if (art.authorName.toLowerCase() === profileData.displayName.toLowerCase()) return true;
          if (art.authorName.toLowerCase() === authorName.toLowerCase()) return true;
          return false;
        });

        setArticles(authorArticles);
      } catch (err: any) {
        console.error('Error fetching author profile details:', err);
        setError(err.message || 'Something went wrong while loading the author profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchAuthorAndArticles();
  }, [authorId, authorName]);

  // Social link icons helper
  const renderSocialIcon = (platform: string, url: string) => {
    const baseClasses = "p-2.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 transition-all duration-300 transform hover:-translate-y-1";
    switch (platform) {
      case 'github':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={baseClasses} title="GitHub Profile">
            <Github className="w-5 h-5" />
          </a>
        );
      case 'twitter':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={baseClasses} title="Twitter/X Profile">
            <Twitter className="w-5 h-5" />
          </a>
        );
      case 'linkedin':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={baseClasses} title="LinkedIn Profile">
            <Linkedin className="w-5 h-5" />
          </a>
        );
      case 'website':
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={baseClasses} title="Personal Website">
            <Globe className="w-5 h-5" />
          </a>
        );
      default:
        return null;
    }
  };

  // Compute total views & likes across articles
  const totalViews = articles.reduce((sum, art) => sum + (art.viewsCount || 0), 0);
  const totalLikes = articles.reduce((sum, art) => sum + (art.likesCount || 0), 0);
  
  // Extract unique categories
  const categories = Array.from(new Set(articles.map(art => art.category)));

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

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative bg-white border border-gray-100 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10 text-left"
      >
        {/* Modal Header Actions */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 border border-gray-100 transition-all z-20 cursor-pointer"
          id="close-author-profile"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 font-mono">Retrieving author bio & dossier...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
            <div className="p-3 bg-red-50 text-red-500 rounded-full">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-lg text-gray-900">Profile Loading Failed</h3>
            <p className="text-sm text-gray-500 max-w-sm">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-all cursor-pointer"
            >
              Return to Feed
            </button>
          </div>
        ) : author ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Author Info Section */}
            <div className="p-8 sm:p-10 border-b border-gray-100 bg-linear-to-b from-indigo-50/20 to-transparent">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                <img
                  src={articles[0]?.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                  alt={author.displayName}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-gray-50"
                />

                <div className="space-y-3 flex-1">
                  <div>
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold font-mono uppercase tracking-wide mb-1.5 border border-indigo-100/30">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Verified Author</span>
                    </div>
                    <h2 className="font-sans font-black text-2xl text-gray-900 tracking-tight">
                      {author.displayName}
                    </h2>
                    <p className="text-xs font-mono font-medium text-gray-400 mt-0.5 uppercase tracking-wider">
                      {author.role}
                    </p>
                  </div>

                  {author.bio && (
                    <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-md">
                      {author.bio}
                    </p>
                  )}

                  {/* Social links */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                    {author.socialLinks?.github && renderSocialIcon('github', author.socialLinks.github)}
                    {author.socialLinks?.twitter && renderSocialIcon('twitter', author.socialLinks.twitter)}
                    {author.socialLinks?.linkedin && renderSocialIcon('linkedin', author.socialLinks.linkedin)}
                    {author.socialLinks?.website && renderSocialIcon('website', author.socialLinks.website)}
                    {author.email && (
                      <a href={`mailto:${author.email}`} className="p-2.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 transition-all duration-300" title={`Email ${author.displayName}`}>
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick statistics */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center justify-center space-x-1.5 text-gray-400 mb-1">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Articles</span>
                  </div>
                  <span className="font-sans font-black text-lg text-gray-800">{articles.length}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center justify-center space-x-1.5 text-gray-400 mb-1">
                    <Eye className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Views</span>
                  </div>
                  <span className="font-sans font-black text-lg text-gray-800">{totalViews}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center justify-center space-x-1.5 text-gray-400 mb-1">
                    <Heart className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-wider">Likes</span>
                  </div>
                  <span className="font-sans font-black text-lg text-gray-800">{totalLikes}</span>
                </div>
              </div>
            </div>

            {/* Articles List Feed */}
            <div className="p-8 sm:p-10 space-y-6">
              <h3 className="font-sans font-black text-lg text-gray-900 tracking-tight flex items-center space-x-2">
                <span>Published Articles</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold font-mono">
                  {articles.length}
                </span>
              </h3>

              {articles.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm font-sans">
                  No articles published by this author yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        onArticleClick(art);
                        onClose();
                      }}
                      className="group p-5 border border-gray-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/10 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full uppercase tracking-wider group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {art.category}
                          </span>

                          <h4 className="font-sans font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors leading-snug">
                            {art.title}
                          </h4>

                          <p className="font-sans text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {art.summary || art.content}
                          </p>

                          <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-medium pt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{art.readTime}</span>
                            </span>
                          </div>
                        </div>

                        <div className="self-center p-2 rounded-xl bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white text-gray-400 transition-all duration-300">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 font-sans">
            Profile not found.
          </div>
        )}
      </motion.div>
    </div>
  );
}
