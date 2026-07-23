import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { LocalDB } from './server_db.js';
import { Article } from './src/types.js';
import { SupabaseService } from './server_supabase.js';
import { PublishingAssistant } from './server_assistant.js';
import { NotificationEngine } from './server_notifications.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parse for client requests
app.use(express.json());

// Lazy initializer for the Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// SUPABASE INTEGRATION ENDPOINTS
// ==========================================
app.get('/api/supabase/status', async (req, res) => {
  try {
    const status = await SupabaseService.testConnection();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/supabase/sync', async (req, res) => {
  try {
    const result = await SupabaseService.syncLocalToSupabase();
    if (result.success && result.syncedCount) {
      res.json({
        ...result,
        articlesMigrated: result.syncedCount.articles || 0,
        subscribersMigrated: result.syncedCount.subscribers || 0,
        resourcesMigrated: result.syncedCount.resources || 0,
        aiToolsMigrated: result.syncedCount.ai_tools || 0,
        knowledgeGuidesMigrated: result.syncedCount.knowledge_guides || 0,
        readerProfilesMigrated: result.syncedCount.reader_profiles || 0,
      });
    } else {
      res.json(result);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/supabase/sql', (req, res) => {
  const sql = `-- SUPABASE POSTGRESQL SCHEMA CREATION SCRIPT
-- Run this script in your Supabase SQL Editor to establish the required tables.

-- 1. Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  author_id TEXT,
  author_name TEXT,
  author_avatar TEXT,
  author_role TEXT,
  status TEXT DEFAULT 'draft',
  featured_image TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  read_time TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_pillar BOOLEAN DEFAULT false,
  workflow_state TEXT DEFAULT 'Draft',
  assigned_author TEXT,
  assigned_editor TEXT,
  due_date TEXT,
  editorial_notes TEXT,
  task_checklist JSONB DEFAULT '[]'::jsonb,
  activity_history JSONB DEFAULT '[]'::jsonb,
  revisions JSONB DEFAULT '[]'::jsonb
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  count INTEGER DEFAULT 0
);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT true
);

-- 5. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  status TEXT DEFAULT 'subscribed',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '[]'::jsonb
);

-- 6. Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  author TEXT,
  file_size TEXT
);

-- 7. AI Tools Table
CREATE TABLE IF NOT EXISTS ai_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  pricing_type TEXT DEFAULT 'Free',
  url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  affiliate_url TEXT,
  logo_url TEXT,
  alternatives JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb
);

-- 8. Topic Clusters Table
CREATE TABLE IF NOT EXISTS topic_clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  pillar_article_id TEXT,
  featured_article_ids JSONB DEFAULT '[]'::jsonb,
  recommended_resource_ids JSONB DEFAULT '[]'::jsonb,
  related_tool_ids JSONB DEFAULT '[]'::jsonb
);

-- 9. Reading Sessions Table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,
  reader_email TEXT,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  scroll_depth NUMERIC DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  engagement_time_seconds INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reader Profiles Table
CREATE TABLE IF NOT EXISTS reader_profiles (
  email TEXT PRIMARY KEY,
  bookmarks JSONB DEFAULT '[]'::jsonb,
  reading_history JSONB DEFAULT '[]'::jsonb,
  streak_count INTEGER DEFAULT 0,
  last_active_date TEXT,
  reading_goal_minutes_per_day INTEGER DEFAULT 10,
  display_name TEXT,
  role TEXT DEFAULT 'registered',
  bio TEXT
);

-- 11. Knowledge Guides Table
CREATE TABLE IF NOT EXISTS knowledge_guides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  learning_path TEXT,
  difficulty TEXT,
  duration_minutes INTEGER DEFAULT 10,
  related_article_ids JSONB DEFAULT '[]'::jsonb,
  related_tool_ids JSONB DEFAULT '[]'::jsonb
);

-- 12. Search Queries Table
CREATE TABLE IF NOT EXISTS search_queries (
  query TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW()
);`;
  res.json({ sql });
});

// ==========================================
// ARTICLE API ENDPOINTS
// ==========================================

// GET all articles with filtering, search, and sorting
app.get('/api/articles', async (req, res) => {
  try {
    let articles = await SupabaseService.getArticles();
    if (!articles) {
      articles = LocalDB.getArticles();
    }
    const { category, search, tag, status, sort, authorId, authorName } = req.query;

    // Filter by status (default is published for regular visitors, can request draft for creators)
    if (status) {
      articles = articles.filter(a => a.status === status);
    } else {
      articles = articles.filter(a => a.status === 'published');
    }

    // Filter by Author ID
    if (authorId) {
      articles = articles.filter(a => a.authorId === authorId);
    }

    // Filter by Author Name
    if (authorName) {
      articles = articles.filter(a => a.authorName.toLowerCase() === (authorName as string).toLowerCase());
    }

    // Filter by Category
    if (category) {
      articles = articles.filter(a => a.category.toLowerCase() === (category as string).toLowerCase());
    }

    // Filter by Tag
    if (tag) {
      articles = articles.filter(a => a.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
    }

    // Text search query matching title, content, or tags
    if (search) {
      const q = (search as string).toLowerCase();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
      );
    }

    // Sort strategy
    if (sort === 'views') {
      articles.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sort === 'likes') {
      articles.sort((a, b) => b.likesCount - a.likesCount);
    } else {
      // default: published date
      articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET an article by slug (increments view count dynamically)
app.get('/api/articles/:slug', async (req, res) => {
  try {
    let article = await SupabaseService.getArticleBySlug(req.params.slug);
    if (!article) {
      article = LocalDB.getArticleBySlug(req.params.slug);
    }
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST to create or edit an article (supports revision history and automatic draft handling)
app.post('/api/articles', async (req, res) => {
  try {
    const { id, title, content, summary, category, tags, authorId, authorName, authorAvatar, authorRole, status, seoTitle, seoDescription } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: "Missing required fields: title, content, category" });
    }

    // Simple robust Slug Generator
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const db = LocalDB.load();
    const existingIndex = id ? db.articles.findIndex(a => a.id === id) : -1;

    let savedArticle: Article;

    // Estimate read time (words / 200 words per minute)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));
    const readTime = `${readTimeMin} min read`;

    const oldStatus = existingIndex >= 0 ? db.articles[existingIndex].status : null;

    if (existingIndex >= 0) {
      // Update existing article, push previous version into revision history if not an autosave
      const old = db.articles[existingIndex];
      const newRevisions = [...(old.revisions || [])];
      
      const isAutosave = req.body.isAutosave === true;
      if (!isAutosave) {
        // Store current state to history before saving updates
        newRevisions.push({
          timestamp: new Date().toISOString(),
          title: old.title,
          content: old.content,
          author: authorName || old.authorName
        });
      }

      savedArticle = {
        ...old,
        title,
        slug,
        content,
        summary: summary || content.slice(0, 160) + "...",
        category,
        tags: tags || [],
        authorRole: authorRole || old.authorRole,
        status: status || old.status,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || summary || content.slice(0, 160),
        readTime,
        revisions: newRevisions
      };

      db.articles[existingIndex] = savedArticle;
    } else {
      // Create new article
      savedArticle = {
        id: id || `art-${Date.now()}`,
        title,
        slug,
        content,
        summary: summary || content.slice(0, 160) + "...",
        category,
        tags: tags || [],
        authorId: authorId || "auth-admin",
        authorName: authorName || "Site Editor",
        authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        authorRole: authorRole || "Chief Content Editor",
        status: status || 'draft',
        featuredImage: req.body.featuredImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date().toISOString(),
        viewsCount: 0,
        likesCount: 0,
        readTime,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || summary || content.slice(0, 160),
        workflowState: status === 'published' ? 'Published' : 'Draft',
        isPillar: false,
        revisions: []
      };

      db.articles.unshift(savedArticle);
    }

    LocalDB.save(db);
    
    // Trigger automated notification if newly published
    if (savedArticle.status === 'published' && oldStatus !== 'published') {
      NotificationEngine.triggerEvent('article_published', {
        articleId: savedArticle.id,
        articleTitle: savedArticle.title,
        category: savedArticle.category,
        authorName: savedArticle.authorName
      }).catch(err => console.error("Failed triggering article published notification", err));
    }
    try {
      await SupabaseService.saveArticle(savedArticle);
    } catch (e) {
      console.error("Failed to sync newly saved article to Supabase:", e);
    }
    res.json(savedArticle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST to increment likes
app.post('/api/articles/:id/like', (req, res) => {
  try {
    const db = LocalDB.load();
    const article = db.articles.find(a => a.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    article.likesCount += 1;
    LocalDB.save(db);
    res.json({ id: article.id, likesCount: article.likesCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE an article
app.delete('/api/articles/:id', (req, res) => {
  try {
    const success = LocalDB.deleteArticle(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// COMMENT ENDPOINTS
// ==========================================
app.get('/api/articles/:id/comments', (req, res) => {
  try {
    res.json(LocalDB.getComments(req.params.id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/articles/:id/comments', (req, res) => {
  try {
    const { authorName, authorAvatar, content, parentId } = req.body;
    if (!authorName || !content) {
      return res.status(400).json({ error: "Missing authorName or content" });
    }
    const comment = LocalDB.addComment({
      id: `com-${Date.now()}`,
      articleId: req.params.id,
      authorName,
      authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      content,
      createdAt: new Date().toISOString(),
      approved: true,
      parentId: parentId || undefined,
      likes: 0,
      likedBy: []
    });

    // Process comment reply notification
    try {
      const db = LocalDB.load();
      if (parentId && db.comments) {
        const parentComment = db.comments.find(c => c.id === parentId);
        if (parentComment) {
          const parentUser = Object.values(db.readerProfiles || {}).find(p => p.displayName === parentComment.authorName);
          const parentEmail = parentUser ? parentUser.email : 'demo.reader@gmail.com';
          const article = db.articles.find(a => a.id === req.params.id);
          
          NotificationEngine.triggerEvent('comment_reply', {
            articleId: req.params.id,
            articleTitle: article ? article.title : 'Discussion Thread',
            replyContent: content,
            parentAuthorEmail: parentEmail,
            parentAuthorName: parentComment.authorName,
            replyAuthorName: authorName
          });
        }
      }
    } catch (err) {
      console.error("Failed executing automated comment reply notification trigger:", err);
    }

    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comments/:commentId/like', (req, res) => {
  try {
    const { email } = req.body;
    const commentId = req.params.commentId;
    const db = LocalDB.load();
    const comment = db.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.likes) comment.likes = 0;

    const emailStr = email || 'anonymous';
    const index = comment.likedBy.indexOf(emailStr);
    if (index > -1) {
      comment.likedBy.splice(index, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(emailStr);
      comment.likes += 1;
    }
    LocalDB.save(db);
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// NEWSLETTER SUBSCRIBERS ENDPOINTS
// ==========================================
app.post('/api/newsletter/subscribe', (req, res) => {
  try {
    const { email, preferences } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const sub = LocalDB.subscribe(email, preferences || []);
    res.json({ success: true, subscriber: sub });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/newsletter/subscribers', (req, res) => {
  try {
    res.json(LocalDB.getSubscribers());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DOWNLOADABLE RESOURCES LIBRARY ENDPOINTS
// ==========================================
app.get('/api/resources', (req, res) => {
  try {
    res.json(LocalDB.getResources());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resources/:id/download', (req, res) => {
  try {
    const resource = LocalDB.incrementDownload(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AI TOOLS DIRECTORY ENDPOINTS
// ==========================================
app.get('/api/ai-tools', (req, res) => {
  try {
    res.json(LocalDB.getTools());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai-tools/:id/review', (req, res) => {
  try {
    const { author, rating, content } = req.body;
    if (!author || !rating || !content) {
      return res.status(400).json({ error: "Missing review parameters: author, rating, content" });
    }
    const tool = LocalDB.addToolReview(req.params.id, { author, rating: Number(rating), content });
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }
    res.json(tool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN DASHBOARD ANALYTICS ENDPOINTS
// ==========================================
app.get('/api/analytics/dashboard', (req, res) => {
  try {
    res.json(LocalDB.getMetrics());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DIGITAL PUBLISHING OPERATIONS CENTER ENDPOINTS
// ==========================================

// AI Tools Administration
app.post('/api/admin/ai-tools', (req, res) => {
  try {
    const db = LocalDB.load();
    const newTool = {
      id: `tool-${Date.now()}`,
      name: req.body.name || "Unnamed Tool",
      description: req.body.description || "",
      category: req.body.category || "General",
      rating: Number(req.body.rating) || 5.0,
      pricingType: req.body.pricingType || "Free",
      url: req.body.url || "",
      features: req.body.features || [],
      affiliateUrl: req.body.affiliateUrl || "",
      logoUrl: req.body.logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100",
      alternatives: req.body.alternatives || [],
      reviews: []
    };
    db.aiTools.push(newTool);
    LocalDB.save(db);
    res.status(201).json(newTool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/ai-tools/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    const index = db.aiTools.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Tool not found" });
    db.aiTools[index] = { ...db.aiTools[index], ...req.body };
    LocalDB.save(db);
    res.json(db.aiTools[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/ai-tools/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    const initialLength = db.aiTools.length;
    db.aiTools = db.aiTools.filter(t => t.id !== req.params.id);
    if (db.aiTools.length === initialLength) return res.status(404).json({ error: "Tool not found" });
    LocalDB.save(db);
    res.json({ success: true, message: "AI tool deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Resource Materials Administration
app.post('/api/admin/resources', (req, res) => {
  try {
    const db = LocalDB.load();
    const newRes = {
      id: `res-${Date.now()}`,
      title: req.body.title || "Unnamed Resource",
      description: req.body.description || "",
      type: req.body.type || "PDF",
      fileUrl: req.body.fileUrl || "#",
      downloadsCount: 0,
      author: req.body.author || "Site Admin",
      fileSize: req.body.fileSize || "1.2 MB"
    };
    db.resources.push(newRes);
    LocalDB.save(db);
    res.status(201).json(newRes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/resources/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    const index = db.resources.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Resource not found" });
    db.resources[index] = { ...db.resources[index], ...req.body };
    LocalDB.save(db);
    res.json(db.resources[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/resources/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    const initialLength = db.resources.length;
    db.resources = db.resources.filter(r => r.id !== req.params.id);
    if (db.resources.length === initialLength) return res.status(404).json({ error: "Resource not found" });
    LocalDB.save(db);
    res.json({ success: true, message: "Resource deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Knowledge Base Guides Administration
app.post('/api/admin/guides', (req, res) => {
  try {
    const db = LocalDB.load();
    const newGuide = {
      id: `guide-${Date.now()}`,
      title: req.body.title || "Unnamed Guide",
      slug: req.body.slug || `guide-${Date.now()}`,
      description: req.body.description || "",
      content: req.body.content || "",
      category: req.body.category || "Artificial Intelligence",
      learningPath: req.body.learningPath || "General Knowledge",
      difficulty: req.body.difficulty || "Beginner",
      durationMinutes: Number(req.body.durationMinutes) || 10,
      relatedArticleIds: req.body.relatedArticleIds || [],
      relatedToolIds: req.body.relatedToolIds || []
    };
    db.knowledgeGuides.push(newGuide);
    LocalDB.save(db);
    res.status(201).json(newGuide);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/guides/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    const index = db.knowledgeGuides.findIndex(g => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Guide not found" });
    db.knowledgeGuides[index] = { ...db.knowledgeGuides[index], ...req.body };
    LocalDB.save(db);
    res.json(db.knowledgeGuides[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/guides/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    const initialLength = db.knowledgeGuides.length;
    db.knowledgeGuides = db.knowledgeGuides.filter(g => g.id !== req.params.id);
    if (db.knowledgeGuides.length === initialLength) return res.status(404).json({ error: "Guide not found" });
    LocalDB.save(db);
    res.json({ success: true, message: "Guide deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Newsletter Subscriber Moderation
app.delete('/api/admin/subscribers/:email', (req, res) => {
  try {
    const db = LocalDB.load();
    db.subscribers = db.subscribers.filter(s => s.email !== req.params.email);
    LocalDB.save(db);
    res.json({ success: true, message: "Subscriber removed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User & Role Administration
app.get('/api/admin/users', (req, res) => {
  try {
    const db = LocalDB.load();
    // Consolidate profiles or return active set
    let profiles = Object.values(db.readerProfiles || {});
    // Seed some admin, editor and author simulation items if none exist or are missing authorIds
    const missingAuthors = !profiles.some(p => (p as any).email === 'sarah.chen@nexus.ai');
    if (profiles.length === 0 || missingAuthors) {
      const seedUsers = [
        { 
          email: "sarah.chen@nexus.ai", 
          authorId: "auth-1",
          displayName: "Sarah Chen", 
          role: "author", 
          preferredCategories: ["Artificial Intelligence"], 
          bio: "Principal AI Research Scientist specializing in large language models, neural network architectures, and multi-agent system orchestrations. Formerly research lead at DeepTech Labs.", 
          bookmarks: [], 
          readingHistory: [], 
          streakCount: 5, 
          lastActiveDate: "2026-07-08", 
          readingGoalMinutesPerDay: 15,
          socialLinks: {
            github: "https://github.com",
            twitter: "https://twitter.com/sarahchen_ai",
            linkedin: "https://linkedin.com/in/sarah-chen",
            website: "https://sarahchen.dev"
          }
        },
        { 
          email: "marcus@nexus.ai", 
          authorId: "auth-2",
          displayName: "Marcus Vance", 
          role: "author", 
          preferredCategories: ["Entrepreneurship"], 
          bio: "Serial technology bootstrapper, venture advisor, and software developer. Over 15 years building sustainable micro-SaaS applications and leading lean product development sprints.", 
          bookmarks: [], 
          readingHistory: [], 
          streakCount: 3, 
          lastActiveDate: "2026-07-07", 
          readingGoalMinutesPerDay: 10,
          socialLinks: {
            github: "https://github.com/marcusv",
            twitter: "https://twitter.com/marcuscodes",
            linkedin: "https://linkedin.com/in/marcusvance",
            website: "https://marcusvance.com"
          }
        },
        { 
          email: "elena.rostova@nexus.ai", 
          authorId: "auth-3",
          displayName: "Elena Rostova", 
          role: "author", 
          preferredCategories: ["Productivity"], 
          bio: "Head of Productivity Engineering at Nexus. Dedicated to building hyper-efficient development pipelines, automation loops, and developer-centric operations models.", 
          bookmarks: [], 
          readingHistory: [], 
          streakCount: 8, 
          lastActiveDate: "2026-07-08", 
          readingGoalMinutesPerDay: 12,
          socialLinks: {
            github: "https://github.com/erostova",
            twitter: "https://twitter.com/elenarostova",
            linkedin: "https://linkedin.com/in/elena-rostova",
            website: "https://rostova.io"
          }
        },
        { 
          email: "editor@nexus.ai", 
          authorId: "auth-admin",
          displayName: "Site Editor", 
          role: "editor", 
          preferredCategories: ["Technology"], 
          bio: "Managing Editor and chief workflow facilitator. Coordinating deep technical insights and ensuring quality, integrity, and depth of our developer manuals.", 
          bookmarks: [], 
          readingHistory: [], 
          streakCount: 12, 
          lastActiveDate: "2026-07-08", 
          readingGoalMinutesPerDay: 20,
          socialLinks: {
            github: "https://github.com",
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com",
            website: "https://nexus.ai"
          }
        },
        { 
          email: "admin@nexus.ai", 
          authorId: "auth-admin",
          displayName: "Global Admin", 
          role: "admin", 
          preferredCategories: [], 
          bio: "Principal Systems Architect and infrastructure coordinator for the Nexus digital publishing network.", 
          bookmarks: [], 
          readingHistory: [], 
          streakCount: 42, 
          lastActiveDate: "2026-07-08", 
          readingGoalMinutesPerDay: 30,
          socialLinks: {
            github: "https://github.com/admin",
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com",
            website: "https://nexus.ai"
          }
        },
        { 
          email: "josphatmuchemi976@gmail.com", 
          authorId: "auth-owner",
          displayName: "Josphat Muchemi", 
          role: "admin", 
          password: "password123",
          preferredCategories: ["Artificial Intelligence", "Technology"], 
          bio: "System Administrator and Lead Platform Director.", 
          bookmarks: [], 
          readingHistory: [], 
          streakCount: 99, 
          lastActiveDate: new Date().toISOString().split('T')[0], 
          readingGoalMinutesPerDay: 30,
          socialLinks: {
            github: "https://github.com",
            twitter: "https://twitter.com",
            linkedin: "https://linkedin.com",
            website: "https://nexus.ai"
          }
        }
      ];
      seedUsers.forEach(u => {
        db.readerProfiles[u.email] = u as any;
      });
      LocalDB.save(db);
      profiles = Object.values(db.readerProfiles || {});
    }
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users', (req, res) => {
  try {
    const db = LocalDB.load();
    const { email, displayName, role, bio } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    db.readerProfiles[email] = {
      email,
      bookmarks: req.body.bookmarks || [],
      readingHistory: req.body.readingHistory || [],
      streakCount: Number(req.body.streakCount) || 0,
      lastActiveDate: req.body.lastActiveDate || "",
      readingGoalMinutesPerDay: Number(req.body.readingGoalMinutesPerDay) || 10,
      ...({
        displayName: displayName || email.split('@')[0],
        role: role || "registered",
        bio: bio || ""
      } as any)
    };
    LocalDB.save(db);
    res.json(db.readerProfiles[email]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:email', (req, res) => {
  try {
    const db = LocalDB.load();
    if (db.readerProfiles[req.params.email]) {
      delete db.readerProfiles[req.params.email];
      LocalDB.save(db);
      res.json({ success: true, message: "User deleted" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication Routes (Local DB Account Registration & Login)
app.post('/api/auth/register', (req, res) => {
  try {
    const db = LocalDB.load();
    const { email, password, displayName, role, bio } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: "Email, password, and display name are required." });
    }

    const emailKey = email.toLowerCase().trim();
    if (db.readerProfiles[emailKey]) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    let finalRole = role || "registered";
    if (emailKey === 'josphatmuchemi976@gmail.com') {
      finalRole = 'admin';
    } else if (finalRole === 'admin') {
      finalRole = 'registered';
    }

    const newUser: any = {
      email: emailKey,
      password: password,
      displayName: displayName.trim(),
      role: finalRole,
      bio: bio || "",
      bookmarks: [],
      readingHistory: [],
      streakCount: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      readingGoalMinutesPerDay: 10,
      authorId: `auth-${Math.random().toString(36).substr(2, 9)}`,
      socialLinks: {
        github: "",
        twitter: "",
        linkedin: "",
        website: ""
      }
    };

    db.readerProfiles[emailKey] = newUser;
    LocalDB.save(db);

    const { password: _, ...userResponse } = newUser;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const db = LocalDB.load();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailKey = email.toLowerCase().trim();
    const user = db.readerProfiles[emailKey];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const userPassword = (user as any).password;
    if (userPassword && userPassword !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (emailKey === 'josphatmuchemi976@gmail.com' && user.role !== 'admin') {
      user.role = 'admin';
    }

    user.lastActiveDate = new Date().toISOString().split('T')[0];
    LocalDB.save(db);

    const { password: _, ...userResponse } = user as any;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all public author profiles
app.get('/api/authors', (req, res) => {
  try {
    const db = LocalDB.load();
    const profiles = Object.values(db.readerProfiles || {});
    // Filter to authors and editors (any system writer/editor)
    const authors = profiles.filter((p: any) => p.role === 'author' || p.role === 'editor' || p.role === 'admin');
    res.json(authors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific author profile by ID, name, or slug
app.get('/api/authors/:authorId', (req, res) => {
  try {
    const authorId = req.params.authorId;
    const db = LocalDB.load();
    const profiles = Object.values(db.readerProfiles || {});
    
    // Find by authorId, email, or displayName
    const author = profiles.find((p: any) => 
      p.authorId === authorId || 
      p.email?.toLowerCase() === authorId.toLowerCase() ||
      p.displayName?.toLowerCase().replace(/\s+/g, '-') === authorId.toLowerCase() ||
      p.displayName?.toLowerCase() === authorId.toLowerCase()
    );
    
    if (!author) {
      // Fallback fallback: look in the hardcoded articles to see if we can generate something basic
      const articles = LocalDB.getArticles();
      const articleForAuthor = articles.find(a => a.authorId === authorId || a.authorName.toLowerCase() === authorId.toLowerCase());
      
      return res.json({
        authorId: authorId,
        displayName: articleForAuthor ? articleForAuthor.authorName : authorId.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: articleForAuthor ? articleForAuthor.authorRole : "Contributing Specialist",
        bio: "Specialist contributor at Nexus, focusing on modern frameworks, system integrations, and secure developer workflows.",
        socialLinks: {
          github: "https://github.com",
          twitter: "https://twitter.com",
          linkedin: "https://linkedin.com",
          website: "https://nexus.ai"
        }
      });
    }
    res.json(author);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Comments Moderation (CRUD & Flagging)
app.delete('/api/admin/comments/:id', (req, res) => {
  try {
    const db = LocalDB.load();
    db.comments = db.comments.filter(c => c.id !== req.params.id);
    LocalDB.save(db);
    res.json({ success: true, message: "Comment deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Status/Actions on articles
app.post('/api/admin/articles/bulk', (req, res) => {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid article list" });
    
    const db = LocalDB.load();
    db.articles = db.articles.map(art => {
      if (ids.includes(art.id)) {
        if (action === 'workflowState') {
          return { ...art, workflowState: value, status: value === 'Published' ? 'published' : 'draft' };
        } else if (action === 'delete') {
          return null as any; // filtered out below
        } else if (action === 'assignAuthor') {
          return { ...art, assignedAuthor: value };
        } else if (action === 'dueDate') {
          return { ...art, dueDate: value };
        }
      }
      return art;
    }).filter(Boolean) as any;

    LocalDB.save(db);
    res.json({ success: true, count: ids.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// GEMINI SERVER-SIDE AI INTEGRATIONS
// ==========================================

// AI summaries endpoint
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for summarizing." });
    }

    const ai = getAI();
    const prompt = `You are a professional technology editor. Read the following article content and generate a concise, high-impact executive summary. Make it structured with 3 bolded key bullet-point takeaways. Output only the bulleted summary:\n\n${content}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Summarizer Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Title suggestion tool
app.post('/api/ai/title-suggestions', async (req, res) => {
  try {
    const { keywords, description } = req.body;
    if (!keywords && !description) {
      return res.status(400).json({ error: "Keywords or topic description is required." });
    }

    const ai = getAI();
    const prompt = `You are an expert tech journalist and SEO copywriter. Suggest 5 compelling, highly clickable, and search-optimized titles for an article with these characteristics:
Keywords: ${keywords || 'none'}
Description/Topic: ${description || 'none'}

Return the suggestions in a JSON list structure containing string items. Example:
["Title Option 1", "Title Option 2"]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        }
      }
    });

    let suggestions = [];
    try {
      suggestions = JSON.parse(response.text || "[]");
    } catch {
      suggestions = [response.text];
    }

    res.json({ suggestions });
  } catch (error: any) {
    console.error("Title Suggestion Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI SEO metadata optimizer
app.post('/api/ai/seo-assistant', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required to generate SEO metadata." });
    }

    const ai = getAI();
    const prompt = `You are an SEO specialist. Analyze the title: "${title}" and content preview: "${content.substring(0, 1000)}"
Generate optimized search engine values conforming to the following JSON structure:
- "seoTitle": High click-through rate, under 60 characters title.
- "seoDescription": Meta description under 155 characters that drives search clicks.
- "keywords": Array of 5 highly-relevant search keywords.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["seoTitle", "seoDescription", "keywords"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("SEO assistant Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Outline generation tool
app.post('/api/ai/content-outline', async (req, res) => {
  try {
    const { topic, focus } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required to generate an outline." });
    }

    const ai = getAI();
    const prompt = `As a senior tech editor, generate a comprehensive, structured article outline for the topic: "${topic}".
Include primary section headings (H2, H3) and 2 sentence notes on what to cover in each. Focus area/notes: ${focus || 'None'}.
Return a clean, detailed markdown response.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ outline: response.text });
  } catch (error: any) {
    console.error("Outline generator Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Reading Level & Vocabulary analysis tool
app.post('/api/ai/reading-level', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for vocabulary and reading level analysis." });
    }

    const ai = getAI();
    const prompt = `You are a linguistic editor. Analyze the vocabulary complexity, writing style, and readability of this technology draft:
"${content.substring(0, 1500)}"

Return a structured evaluation in this exact JSON structure:
- "gradeLevel": Recommended reader level (e.g. "College Level", "10th Grade", "High School")
- "readingTime": Total reading duration (e.g. "4 min read")
- "score": Numeric score from 1-100 indicating accessibility
- "suggestions": Array of 3 short recommendations to improve clarity or narrative flow.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gradeLevel: { type: Type.STRING },
            readingTime: { type: Type.STRING },
            score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["gradeLevel", "readingTime", "score", "suggestions"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Reading Level Analyzer Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Prompt Engineering & Editorial Preset Prompt Library
app.get('/api/ai/prompts', (req, res) => {
  // Return elite, ready-to-use prompt engineering patterns and editorial assistants
  const library = [
    {
      id: "p-1",
      title: "The ReAct (Reason + Action) Pattern",
      description: "Force the model to think explicitly before choosing an action tool.",
      template: "You are an autonomous agent. Complete the task using this sequence: [Thought -> Action -> Observation].\nTask: {{task}}\nSolve step-by-step:"
    },
    {
      id: "p-2",
      title: "The Few-Shot Dynamic Exemplar",
      description: "Instruct models with complex output formats through a sequence of perfect examples.",
      template: "Input: Translate tech slang to clean prose.\nExample 1: 'deploy to prod on Friday' -> 'releasing updates at the end of the week.'\nExample 2: 'this is a total blocker' -> 'this is preventing progress.'\nInput: {{input}} ->"
    },
    {
      id: "p-3",
      title: "Dynamic JSON Schema Extractor",
      description: "Safely isolate parameters and cast string text into robust API interfaces.",
      template: "Analyze the tech blog draft and output valid JSON following the schema { sentiment: 'positive'|'neutral', topic: string, tags: string[] }.\nDraft: {{draft}}"
    },
    {
      id: "prompt-outline",
      title: "Structural Outline Planner",
      description: "Generate a comprehensive, highly-structured editorial outline with target keywords and hierarchical H2/H3 headings.",
      template: "You are a senior publishing strategist. Draft a detailed article outline for the topic: \"{{topic}}\" using the keywords: \"{{keywords}}\". Structure it with H2 and H3 subheadings, highlighting search intent for each section."
    },
    {
      id: "prompt-seo",
      title: "SEO Metadata Optimizer",
      description: "Create search-optimized page titles and meta descriptions designed to maximize organic CTR based on the article's core content.",
      template: "You are an SEO copywriting expert. Analyze the following draft title: \"{{title}}\" and draft content: \"{{content}}\". Generate 3 alternative SEO-optimized titles (under 60 characters) and 3 meta descriptions (under 155 characters) that capture interest and search intent."
    },
    {
      id: "prompt-readability",
      title: "Professional Readability Editor",
      description: "Refine word choice, simplify complex sentence structures, and break down dense prose for an audience of high-level developers and professionals.",
      template: "You are an expert tech editor. Revise the following draft content to maximize professional readability while maintaining high technical precision: \"{{content}}\". Simplify passive phrasing, improve rhythm, and format key takeaways as bullet points."
    },
    {
      id: "prompt-hooks",
      title: "Catchy Title Hook Generator",
      description: "Generate 5 click-worthy, professional headline variations tailored for tech audiences and social media feeds.",
      template: "You are a creative viral writer for tech publications. Generate 5 unique, click-worthy, high-engagement title hooks for an article about \"{{title}}\" that discusses \"{{summary}}\". Do not use clickbait jargon; maintain high authority."
    },
    {
      id: "prompt-summary",
      title: "Executive Key Takeaways",
      description: "Synthesize lengthy technical content into an elegant, high-impact executive summary.",
      template: "You are an industry analyst. Summarize the following technical content into a 3-bullet executive summary focusing strictly on business outcomes, technical hurdles, and key architectural innovations:\n\n\"{{content}}\""
    }
  ];
  res.json(library);
});


// ==========================================
// DPOS ADVANCED ENGINE ENDPOINTS (MODULES 1-12)
// ==========================================

// MODULE 1 - Editorial Workflow Engine Update
app.patch('/api/articles/:id/workflow', (req, res) => {
  try {
    const db = LocalDB.load();
    const art = db.articles.find(a => a.id === req.params.id);
    if (!art) {
      return res.status(404).json({ error: "Article not found" });
    }

    const { workflowState, assignedAuthor, assignedEditor, dueDate, editorialNotes, taskChecklist, activityItem } = req.body;

    if (workflowState) art.workflowState = workflowState;
    if (assignedAuthor !== undefined) art.assignedAuthor = assignedAuthor;
    if (assignedEditor !== undefined) art.assignedEditor = assignedEditor;
    if (dueDate !== undefined) art.dueDate = dueDate;
    if (editorialNotes !== undefined) art.editorialNotes = editorialNotes;
    if (taskChecklist !== undefined) art.taskChecklist = taskChecklist;

    if (!art.activityHistory) art.activityHistory = [];
    if (activityItem) {
      art.activityHistory.push({
        timestamp: new Date().toISOString(),
        action: activityItem.action,
        user: activityItem.user || "System"
      });
    }

    // Automatically transition published state in core system
    if (workflowState === 'Published') {
      art.status = 'published';
      art.publishedAt = new Date().toISOString();
    } else if (workflowState === 'Draft') {
      art.status = 'draft';
    }

    LocalDB.save(db);
    res.json(art);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 2 - Version Control Revisions list
app.get('/api/articles/:id/revisions', (req, res) => {
  try {
    const articles = LocalDB.getArticles();
    const art = articles.find(a => a.id === req.params.id);
    if (!art) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(art.revisions || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 2 - Restore revision
app.post('/api/articles/:id/revisions/restore', (req, res) => {
  try {
    const db = LocalDB.load();
    const art = db.articles.find(a => a.id === req.params.id);
    if (!art) {
      return res.status(404).json({ error: "Article not found" });
    }

    const { timestamp } = req.body;
    if (!timestamp) {
      return res.status(400).json({ error: "Timestamp of revision is required." });
    }

    const rev = art.revisions.find(r => r.timestamp === timestamp);
    if (!rev) {
      return res.status(404).json({ error: "Revision not found." });
    }

    // Save current content to revisions before reverting
    const currentRevision = {
      timestamp: new Date().toISOString(),
      title: art.title,
      content: art.content,
      author: "System Restored",
      note: `Pre-restoration backup`
    };
    art.revisions.push(currentRevision);

    // Revert core content
    art.title = rev.title;
    art.content = rev.content;
    
    // Simple slug regenerate
    art.slug = rev.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (!art.activityHistory) art.activityHistory = [];
    art.activityHistory.push({
      timestamp: new Date().toISOString(),
      action: `Restored to version from ${new Date(timestamp).toLocaleString()}`,
      user: "Creator"
    });

    LocalDB.save(db);
    res.json(art);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 5 - Topic Clusters CRUD
app.get('/api/clusters', (req, res) => {
  try {
    res.json(LocalDB.getClusters());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clusters/:slug', (req, res) => {
  try {
    const cluster = LocalDB.getClusterBySlug(req.params.slug);
    if (!cluster) {
      return res.status(404).json({ error: "Cluster not found" });
    }
    res.json(cluster);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clusters', (req, res) => {
  try {
    const { id, name, description, pillarArticleId, featuredArticleIds, recommendedResourceIds, relatedToolIds } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required for topic clusters." });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const cluster = LocalDB.saveCluster({
      id: id || `cluster-${Date.now()}`,
      name,
      slug,
      description,
      pillarArticleId,
      featuredArticleIds: featuredArticleIds || [],
      recommendedResourceIds: recommendedResourceIds || [],
      relatedToolIds: relatedToolIds || []
    });

    res.json(cluster);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 6, 7 & 9 - Reader Profile & Analytics Endpoints
app.get('/api/reader/profile', (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    res.json(LocalDB.getReaderProfile(email));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reader/profile', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const existing = LocalDB.getReaderProfile(email) || {};
    const profile = LocalDB.saveReaderProfile({
      ...existing,
      ...req.body
    });
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reader/bookmark', (req, res) => {
  try {
    const { email, articleId } = req.body;
    if (!email || !articleId) {
      return res.status(400).json({ error: "Missing email or articleId" });
    }
    const profile = LocalDB.addArticleBookmark(email, articleId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reader/bookmark/remove', (req, res) => {
  try {
    const { email, articleId } = req.body;
    if (!email || !articleId) {
      return res.status(400).json({ error: "Missing email or articleId" });
    }
    const profile = LocalDB.removeArticleBookmark(email, articleId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cookie Consent API Endpoints
app.get('/api/cookie-consent', (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    const consent = LocalDB.getCookieConsent(email);
    res.json(consent || {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      consentVersion: "1.0.0",
      consentDate: null,
      updatedAt: null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cookie-consent', (req, res) => {
  try {
    const { email, essential, analytics, marketing, functional, consentVersion, consentDate } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required to save preferences." });
    }
    
    // Validate email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    const consent = LocalDB.saveCookieConsent(email, {
      essential: true,
      analytics: !!analytics,
      marketing: !!marketing,
      functional: !!functional,
      consentVersion: consentVersion || "1.0.0",
      consentDate: consentDate || new Date().toISOString()
    });

    console.log(`[CookieConsent] Stored/updated consent for ${email.toLowerCase()}:`, {
      analytics: !!analytics,
      marketing: !!marketing,
      functional: !!functional,
      version: consentVersion || "1.0.0"
    });

    res.json({ success: true, consent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reading-session', (req, res) => {
  try {
    const { readerEmail, articleId, scrollDepth, completed, engagementTimeSeconds } = req.body;
    if (!articleId) {
      return res.status(400).json({ error: "articleId is required" });
    }

    const session = {
      id: `session-${Date.now()}`,
      readerEmail: readerEmail || "anonymous",
      articleId,
      scrollDepth: scrollDepth || 0,
      completed: !!completed,
      engagementTimeSeconds: Number(engagementTimeSeconds) || 0,
      timestamp: new Date().toISOString()
    };

    LocalDB.recordReadingSession(session);
    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 10 - Knowledge Base Guides Endpoints
app.get('/api/guides', (req, res) => {
  try {
    res.json(LocalDB.getGuides());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guides/:slug', (req, res) => {
  try {
    const guide = LocalDB.getGuideBySlug(req.params.slug);
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }
    res.json(guide);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 12 - Autocomplete Search and analytics recording
app.post('/api/search/query', (req, res) => {
  try {
    const { query } = req.body;
    LocalDB.recordSearchQuery(query);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/search/autocomplete', (req, res) => {
  try {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const articles = LocalDB.getArticles().filter(a => a.status === 'published');
    const guides = LocalDB.getGuides();
    const popular = LocalDB.getPopularSearches(6);

    let suggestions: string[] = [];

    if (q) {
      // Find matching tags/categories/titles
      const matchedTitles = articles.filter(a => a.title.toLowerCase().includes(q)).map(a => a.title).slice(0, 3);
      const matchedGuides = guides.filter(g => g.title.toLowerCase().includes(q)).map(g => g.title).slice(0, 3);
      suggestions = Array.from(new Set([...matchedTitles, ...matchedGuides]));
    } else {
      suggestions = popular.map(p => p.query);
    }

    res.json({ suggestions, popular });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// NOTIFICATION & ENGAGEMENT AUDIENCE SYSTEM ENDPOINTS (MASTER ENGAGEMENT ENGINE)
// ============================================================================

// 1. Fetch User notifications
app.get('/api/notifications', (req, res) => {
  try {
    const { email, category, status, q, page, limit } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email query parameter is required." });
    }
    const result = NotificationEngine.getUserNotifications(email as string, {
      category: category as string,
      status: status as string,
      q: q as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Mark notification read/unread
app.post('/api/notifications/mark-read', (req, res) => {
  try {
    const { email, id, unread } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const db = LocalDB.load();
    const userEmail = email.toLowerCase().trim();
    if (!db.notifications) db.notifications = [];

    if (id) {
      const idx = db.notifications.findIndex(n => n.id === id && n.userId === userEmail);
      if (idx !== -1) {
        db.notifications[idx].isRead = !unread;
      }
    } else {
      db.notifications.forEach(n => {
        if (n.userId === userEmail) {
          n.isRead = true;
        }
      });
    }
    LocalDB.save(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Archive or delete notification
app.post('/api/notifications/delete', (req, res) => {
  try {
    const { email, id, action } = req.body;
    if (!email || !id) {
      return res.status(400).json({ error: "Email and notification id are required." });
    }
    const db = LocalDB.load();
    const userEmail = email.toLowerCase().trim();
    if (!db.notifications) db.notifications = [];

    const idx = db.notifications.findIndex(n => n.id === id && n.userId === userEmail);
    if (idx !== -1) {
      if (action === 'archive') {
        db.notifications[idx].isArchived = true;
      } else {
        db.notifications[idx].isDeleted = true;
      }
    }
    LocalDB.save(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get/Post Notification Preferences
app.get('/api/notifications/preferences', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const prefs = NotificationEngine.getUserPreferences(email as string);
    res.json(prefs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/preferences', (req, res) => {
  try {
    const { email, categories } = req.body;
    if (!email || !categories) {
      return res.status(400).json({ error: "Email and categories configurations are required." });
    }
    const prefs = NotificationEngine.updateUserPreferences(email, categories);
    res.json(prefs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Register Browser Push Subscription
app.post('/api/push/subscribe', (req, res) => {
  try {
    const { email, subscription, deviceType, browser } = req.body;
    if (!email || !subscription) {
      return res.status(400).json({ error: "Email and push subscription details are required." });
    }
    const db = LocalDB.load();
    if (!db.pushSubscriptions) db.pushSubscriptions = [];
    
    const userEmail = email.toLowerCase().trim();
    const endpoint = subscription.endpoint;

    const existingIdx = db.pushSubscriptions.findIndex(s => s.endpoint === endpoint);
    const subItem = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userEmail,
      endpoint,
      keys: {
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || ''
      },
      deviceType: deviceType || 'desktop',
      browser: browser || 'chrome',
      createdAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      db.pushSubscriptions[existingIdx] = subItem;
    } else {
      db.pushSubscriptions.push(subItem);
    }
    LocalDB.save(db);
    res.json(subItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Track Opens and Clicks
app.get('/api/notifications/track', (req, res) => {
  try {
    const { type, email, campaignId, notificationId, deepLink } = req.query;
    if (!type || !email) {
      return res.status(400).json({ error: "Missing tracking type or email." });
    }

    NotificationEngine.trackEvent(
      type as 'open' | 'click',
      email as string,
      campaignId as string || undefined,
      notificationId as string || undefined
    );

    if (type === 'click' && deepLink) {
      return res.redirect(deepLink as string);
    }

    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': buf.length
    });
    res.end(buf);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get Admin Analytics
app.get('/api/admin/notification-analytics', (req, res) => {
  try {
    NotificationEngine.seedMockAnalytics('josphatmuchemi976@gmail.com');
    const analytics = NotificationEngine.getAnalytics();
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Admin Campaign Templates
app.get('/api/admin/notification-templates', (req, res) => {
  try {
    const db = LocalDB.load();
    res.json(db.notificationTemplates || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/notification-templates', (req, res) => {
  try {
    const { id, name, subject, title, body, category } = req.body;
    if (!name || !title || !body) {
      return res.status(400).json({ error: "Name, title, and body are required." });
    }
    const db = LocalDB.load();
    if (!db.notificationTemplates) db.notificationTemplates = [];

    const newTemplate = {
      id: id || `tmpl-${Date.now()}`,
      name,
      subject: subject || '',
      title,
      body,
      category: category || 'System',
      createdAt: new Date().toISOString()
    };

    const existingIdx = db.notificationTemplates.findIndex(t => t.id === newTemplate.id);
    if (existingIdx !== -1) {
      db.notificationTemplates[existingIdx] = newTemplate;
    } else {
      db.notificationTemplates.push(newTemplate);
    }

    LocalDB.save(db);
    res.json(newTemplate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Admin Segments
app.get('/api/admin/campaign-segments', (req, res) => {
  try {
    const db = LocalDB.load();
    res.json(db.campaignSegments || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/campaign-segments', (req, res) => {
  try {
    const { id, name, filters } = req.body;
    if (!name) return res.status(400).json({ error: "Segment name is required." });
    
    const db = LocalDB.load();
    if (!db.campaignSegments) db.campaignSegments = [];

    const newSegment = {
      id: id || `seg-${Date.now()}`,
      name,
      filters: filters || {},
      createdAt: new Date().toISOString()
    };

    const existingIdx = db.campaignSegments.findIndex(s => s.id === newSegment.id);
    if (existingIdx !== -1) {
      db.campaignSegments[existingIdx] = newSegment;
    } else {
      db.campaignSegments.push(newSegment);
    }
    LocalDB.save(db);
    res.json(newSegment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Admin Campaigns
app.get('/api/admin/campaigns', (req, res) => {
  try {
    const db = LocalDB.load();
    res.json(db.notificationCampaigns || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/campaigns', async (req, res) => {
  try {
    const { id, name, templateId, type, segmentId, scheduleType, scheduledTime, recurrence } = req.body;
    if (!name || !templateId || !segmentId) {
      return res.status(400).json({ error: "Missing campaign name, template, or target segment." });
    }
    const db = LocalDB.load();
    if (!db.notificationCampaigns) db.notificationCampaigns = [];

    const newCampaign = {
      id: id || `camp-${Date.now()}`,
      name,
      templateId,
      type: type || 'Announcement',
      segmentId,
      scheduleType: scheduleType || 'immediate',
      scheduledTime,
      recurrence,
      status: (scheduleType === 'scheduled') ? 'scheduled' : 'draft',
      createdAt: new Date().toISOString(),
      sentCount: 0,
      openCount: 0,
      clickCount: 0
    } as any;

    const existingIdx = db.notificationCampaigns.findIndex(c => c.id === newCampaign.id);
    if (existingIdx !== -1) {
      db.notificationCampaigns[existingIdx] = newCampaign;
    } else {
      db.notificationCampaigns.push(newCampaign);
    }
    LocalDB.save(db);

    if (scheduleType === 'immediate') {
      try {
        await NotificationEngine.sendCampaign(newCampaign.id);
      } catch (err) {
        console.error("Failed to deliver campaign immediately", err);
      }
    }

    res.json(newCampaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Admin Automation Rules
app.get('/api/admin/automation-rules', (req, res) => {
  try {
    const db = LocalDB.load();
    res.json(db.automationRules || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/automation-rules', (req, res) => {
  try {
    const { id, name, triggerEvent, templateId, isActive, delayMinutes } = req.body;
    if (!name || !triggerEvent || !templateId) {
      return res.status(400).json({ error: "Missing rule name, trigger event, or template." });
    }
    const db = LocalDB.load();
    if (!db.automationRules) db.automationRules = [];

    const rule = {
      id: id || `rule-${Date.now()}`,
      name,
      triggerEvent,
      templateId,
      isActive: isActive !== false,
      delayMinutes: delayMinutes || 0,
      createdAt: new Date().toISOString()
    };

    const existingIdx = db.automationRules.findIndex(r => r.id === rule.id);
    if (existingIdx !== -1) {
      db.automationRules[existingIdx] = rule;
    } else {
      db.automationRules.push(rule);
    }
    LocalDB.save(db);
    res.json(rule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MODULE 11 - AI Content Intelligence Endpoints (Gemini API driven)

app.post('/api/ai/internal-links', async (req, res) => {
  try {
    const { id, title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for linking analysis." });
    }

    const articles = LocalDB.getArticles()
      .filter(a => a.id !== id && a.status === 'published')
      .map(a => ({ id: a.id, title: a.title, category: a.category }));

    const ai = getAI();
    const prompt = `You are a technical SEO specialist. Map out strategic internal contextual links for a new tech article.
New Article Title: "${title || 'Untitled Draft'}"
New Article Content Preview: "${content.substring(0, 1000)}"

Here is our catalog of already published articles:
${JSON.stringify(articles, null, 2)}

Identify up to 3 published articles from the catalog that would naturally serve as high-relevance hyperlinks. For each, output:
1. "targetArticleId": The ID of the article from the catalog.
2. "anchorText": A precise, natural 2-5 word anchor text string that should be placed in our content to link to it.
3. "contextHint": Briefly explain why this link fits.

Output as a strict JSON array conforming to this schema:
[
  { "targetArticleId": "art-1", "anchorText": "large language models", "contextHint": "Fits in paragraph 2 discussing AI transformers." }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              targetArticleId: { type: Type.STRING },
              anchorText: { type: Type.STRING },
              contextHint: { type: Type.STRING }
            },
            required: ["targetArticleId", "anchorText", "contextHint"]
          }
        }
      }
    });

    res.json({ recommendations: JSON.parse(response.text || "[]") });
  } catch (error: any) {
    console.error("Internal links AI error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/tone-check', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for tone analysis." });
    }

    const ai = getAI();
    const prompt = `You are an editorial writing coach. Evaluate the primary tone and vocabulary complexity of this technology draft:
"${content.substring(0, 1500)}"

Return a structured tone analysis in this exact JSON format:
- "toneType": The dominant voice (e.g. "Authoritative & Technical", "Enthusiastic & Entrepreneurial", "Friendly & Instructive", "Academic")
- "readingEaseScore": Score from 1 to 100 where higher is easier.
- "sentiment": Positive, Neutral, or Muted.
- "editorialCritique": A detailed paragraph coaching the author on how to sound more persuasive, authentic, and clear for developers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            toneType: { type: Type.STRING },
            readingEaseScore: { type: Type.NUMBER },
            sentiment: { type: Type.STRING },
            editorialCritique: { type: Type.STRING }
          },
          required: ["toneType", "readingEaseScore", "sentiment", "editorialCritique"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Tone analyzer AI error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/social-captions', async (req, res) => {
  try {
    const { title, summary } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required for generating social captions." });
    }

    const ai = getAI();
    const prompt = `You are an expert social media manager for tech leaders. Read this article description:
Title: "${title}"
Summary: "${summary || 'General technology overview'}"

Generate three custom promotional captions optimized for these channels:
1. "linkedin": Professional, high-leverage business angle, structured with bullet points.
2. "x": Punchy, short (under 260 characters), highly engaging hook to drive clicks, 2 tags.
3. "newsletter": A short, persuasive editorial intro text (3-4 sentences) that can be sent in an email campaign.

Conform strictly to this JSON response structure:
{
  "linkedin": "...",
  "x": "...",
  "newsletter": "..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            linkedin: { type: Type.STRING },
            x: { type: Type.STRING },
            newsletter: { type: Type.STRING }
          },
          required: ["linkedin", "x", "newsletter"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Social caption generator error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/faq-generator', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for FAQ generation." });
    }

    const ai = getAI();
    const prompt = `You are an expert technical documentation writer. Analyze the article "${title || 'Draft'}" and generate 3 frequently asked questions (FAQs) with detailed, technically-accurate answers based on the content.
Draft content: "${content.substring(0, 1500)}"

Return a strict JSON array conforming to this schema:
[
  { "question": "...", "answer": "..." }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    res.json({ faqs: JSON.parse(response.text || "[]") });
  } catch (error: any) {
    console.error("FAQ generation AI error:", error);
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// INTELLIGENT AI PUBLISHING ASSISTANT ENDPOINTS
// ==========================================
app.get('/api/assistant/insights', async (req, res) => {
  try {
    const insights = PublishingAssistant.analyzePlatform();
    res.json({ insights });
  } catch (error: any) {
    console.error("AI Assistant Insights fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assistant/resolve', async (req, res) => {
  try {
    const { insightId, actionType, payload } = req.body;
    if (!insightId || !actionType) {
      return res.status(400).json({ error: "Missing required fields insightId and actionType." });
    }
    const result = await PublishingAssistant.resolveInsight(insightId, actionType, payload || {});
    res.json(result);
  } catch (error: any) {
    console.error("AI Assistant resolve error:", error);
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// PAYPAL INTEGRATION ENDPOINTS
// ==========================================
app.post('/api/paypal/validate-credentials', async (req, res) => {
  try {
    const { clientId, clientSecret, environment } = req.body;
    if (!clientId || !clientSecret) {
      return res.status(400).json({ success: false, error: "Missing PayPal Client ID or Client Secret." });
    }

    // Graceful handling of placeholder keys
    if (clientId.includes("placeholder") || clientSecret.includes("placeholder")) {
      return res.json({
        success: true,
        simulated: true,
        message: "Validated successfully under simulated Sandbox test credentials (AX_placeholder...). Note: For live operations, please input real PayPal Developer credentials."
      });
    }

    const base = environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorDetail = "Failed to authenticate with PayPal.";
      try {
        const parsed = JSON.parse(errText);
        errorDetail = parsed.error_description || parsed.message || errorDetail;
      } catch (e) {}
      throw new Error(`PayPal credentials rejected: ${errorDetail}`);
    }

    const data: any = await response.json();
    if (data.access_token) {
      res.json({
        success: true,
        message: `PayPal Merchant API status checked: Integration Live & Authenticated successfully! (Environment: ${environment})`
      });
    } else {
      throw new Error("No access token returned in PayPal authorization response.");
    }
  } catch (error: any) {
    console.error("PayPal validation error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});


// ==========================================
// VITE DEV SERVER AND PRODUCTION SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode mounting Vite dev server for hot asset compilation
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware in development mode.");
  } else {
    // Production mode serving pre-compiled static files from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving pre-compiled static files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on port ${PORT}`);
    console.log(`Dev app URL: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot the express server:", err);
});
