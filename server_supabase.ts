import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { LocalDB } from './server_db.js';
import { 
  Article, 
  Category, 
  Tag, 
  Comment, 
  Subscriber, 
  Resource, 
  AITool, 
  TopicCluster, 
  ReadingSession, 
  ReaderProfile, 
  KnowledgeHubGuide, 
  SearchQueryAnalytics,
  DBStructure
} from './src/types.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl) {
    return null;
  }
  const activeKey = supabaseServiceRoleKey || supabaseAnonKey;
  if (!activeKey) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, activeKey, {
        auth: {
          persistSession: false
        }
      });
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }
  return supabaseClient;
}

export const SupabaseService = {
  isConfigured(): boolean {
    return !!supabaseUrl && (!!supabaseAnonKey || !!supabaseServiceRoleKey);
  },

  async testConnection(): Promise<{ 
    connected: boolean; 
    message: string; 
    tablesStatus: Record<string, boolean>;
    envPresent: boolean;
  }> {
    const envPresent = this.isConfigured();
    if (!envPresent) {
      return {
        connected: false,
        message: "Supabase environment variables (SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY) are not set.",
        tablesStatus: {},
        envPresent: false
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        connected: false,
        message: "Failed to create Supabase client instance.",
        tablesStatus: {},
        envPresent: true
      };
    }

    const tables = [
      'articles', 'categories', 'tags', 'comments', 'subscribers', 
      'resources', 'ai_tools', 'topic_clusters', 'reading_sessions', 
      'reader_profiles', 'knowledge_guides', 'search_queries'
    ];
    
    const tablesStatus: Record<string, boolean> = {};
    let connected = false;
    let message = "Supabase API connection established. Checking tables...";

    try {
      // Test basic connection by querying a small list
      const { data, error } = await client.from('categories').select('id').limit(1);
      if (error) {
        // If categories table doesn't exist, we can still be "connected" but missing tables
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          connected = true;
          message = "Connected to Supabase! However, the database tables do not exist yet. Please run the provided SQL setup script in your Supabase SQL Editor.";
        } else {
          return {
            connected: false,
            message: `Connection test failed: ${error.message} (Code: ${error.code})`,
            tablesStatus: {},
            envPresent: true
          };
        }
      } else {
        connected = true;
        message = "Connected to Supabase! Database connection and schema verification completed successfully.";
      }

      // Check existence of all tables
      for (const table of tables) {
        const { error: tError } = await client.from(table).select().limit(0);
        if (tError && (tError.code === 'PGRST116' || tError.message.includes('does not exist') || tError.message.includes('undefined_table'))) {
          tablesStatus[table] = false;
        } else {
          tablesStatus[table] = true;
        }
      }
    } catch (e: any) {
      return {
        connected: false,
        message: `Unexpected error connecting to Supabase: ${e.message}`,
        tablesStatus: {},
        envPresent: true
      };
    }

    return {
      connected,
      message,
      tablesStatus,
      envPresent: true
    };
  },

  async syncLocalToSupabase(): Promise<{ success: boolean; message: string; syncedCount: Record<string, number> }> {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase is not configured.");
    }

    const localData = LocalDB.load();
    const syncedCount: Record<string, number> = {
      categories: 0,
      tags: 0,
      articles: 0,
      comments: 0,
      subscribers: 0,
      resources: 0,
      ai_tools: 0,
      topic_clusters: 0,
      reading_sessions: 0,
      reader_profiles: 0,
      knowledge_guides: 0,
      search_queries: 0
    };

    try {
      // 1. Sync Categories
      if (localData.categories && localData.categories.length > 0) {
        const formattedCategories = localData.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || ''
        }));
        const { error } = await client.from('categories').upsert(formattedCategories);
        if (error) throw new Error(`Categories sync failed: ${error.message}`);
        syncedCount.categories = formattedCategories.length;
      }

      // 2. Sync Tags
      if (localData.tags && localData.tags.length > 0) {
        const { error } = await client.from('tags').upsert(localData.tags);
        if (error) throw new Error(`Tags sync failed: ${error.message}`);
        syncedCount.tags = localData.tags.length;
      }

      // 3. Sync Articles
      if (localData.articles && localData.articles.length > 0) {
        const formattedArticles = localData.articles.map(art => ({
          id: art.id,
          title: art.title,
          slug: art.slug,
          summary: art.summary,
          content: art.content,
          category: art.category,
          tags: art.tags,
          author_id: art.authorId,
          author_name: art.authorName,
          author_avatar: art.authorAvatar,
          author_role: art.authorRole,
          status: art.status,
          featured_image: art.featuredImage,
          published_at: art.publishedAt,
          views_count: art.viewsCount || 0,
          likes_count: art.likesCount || 0,
          read_time: art.readTime,
          seo_title: art.seoTitle,
          seo_description: art.seoDescription,
          is_pillar: art.isPillar || false,
          workflow_state: art.workflowState || 'Published',
          assigned_author: art.assignedAuthor,
          assigned_editor: art.assignedEditor,
          due_date: art.dueDate,
          editorial_notes: art.editorialNotes,
          task_checklist: art.taskChecklist || [],
          activity_history: art.activityHistory || [],
          revisions: art.revisions || []
        }));

        const { error } = await client.from('articles').upsert(formattedArticles);
        if (error) throw new Error(`Articles sync failed: ${error.message}`);
        syncedCount.articles = formattedArticles.length;
      }

      // 4. Sync Comments
      if (localData.comments && localData.comments.length > 0) {
        const formattedComments = localData.comments.map(c => ({
          id: c.id,
          article_id: c.articleId,
          author_name: c.authorName,
          author_avatar: c.authorAvatar,
          content: c.content,
          created_at: c.createdAt,
          approved: c.approved !== false
        }));

        const { error } = await client.from('comments').upsert(formattedComments);
        if (error) throw new Error(`Comments sync failed: ${error.message}`);
        syncedCount.comments = formattedComments.length;
      }

      // 5. Sync Subscribers
      if (localData.subscribers && localData.subscribers.length > 0) {
        const formattedSubs = localData.subscribers.map(s => ({
          email: s.email,
          status: s.status,
          subscribed_at: s.subscribedAt,
          preferences: s.preferences
        }));

        const { error } = await client.from('subscribers').upsert(formattedSubs);
        if (error) throw new Error(`Subscribers sync failed: ${error.message}`);
        syncedCount.subscribers = formattedSubs.length;
      }

      // 6. Sync Resources
      if (localData.resources && localData.resources.length > 0) {
        const formattedResources = localData.resources.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          type: r.type,
          file_url: r.fileUrl,
          downloads_count: r.downloadsCount || 0,
          author: r.author,
          file_size: r.fileSize
        }));

        const { error } = await client.from('resources').upsert(formattedResources);
        if (error) throw new Error(`Resources sync failed: ${error.message}`);
        syncedCount.resources = formattedResources.length;
      }

      // 7. Sync AI Tools
      if (localData.aiTools && localData.aiTools.length > 0) {
        const formattedTools = localData.aiTools.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          rating: t.rating,
          pricing_type: t.pricingType,
          url: t.url,
          features: t.features,
          affiliate_url: t.affiliateUrl,
          logo_url: t.logoUrl,
          alternatives: t.alternatives,
          reviews: t.reviews
        }));

        const { error } = await client.from('ai_tools').upsert(formattedTools);
        if (error) throw new Error(`AI Tools sync failed: ${error.message}`);
        syncedCount.ai_tools = formattedTools.length;
      }

      // 8. Sync Topic Clusters
      if (localData.topicClusters && localData.topicClusters.length > 0) {
        const formattedClusters = localData.topicClusters.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          pillar_article_id: c.pillarArticleId,
          featured_article_ids: c.featuredArticleIds,
          recommended_resource_ids: c.recommendedResourceIds,
          related_tool_ids: c.relatedToolIds
        }));

        const { error } = await client.from('topic_clusters').upsert(formattedClusters);
        if (error) throw new Error(`Topic Clusters sync failed: ${error.message}`);
        syncedCount.topic_clusters = formattedClusters.length;
      }

      // 9. Sync Reader Profiles
      if (localData.readerProfiles && Object.keys(localData.readerProfiles).length > 0) {
        const formattedProfiles = Object.values(localData.readerProfiles).map((p: any) => ({
          email: p.email,
          bookmarks: p.bookmarks || [],
          reading_history: p.readingHistory || [],
          streak_count: p.streakCount || 0,
          last_active_date: p.lastActiveDate,
          reading_goal_minutes_per_day: p.readingGoalMinutesPerDay || 10,
          display_name: p.displayName || '',
          role: p.role || 'registered',
          bio: p.bio || ''
        }));

        const { error } = await client.from('reader_profiles').upsert(formattedProfiles);
        if (error) throw new Error(`Reader Profiles sync failed: ${error.message}`);
        syncedCount.reader_profiles = formattedProfiles.length;
      }

      // 10. Sync Knowledge Guides
      if (localData.knowledgeGuides && localData.knowledgeGuides.length > 0) {
        const formattedGuides = localData.knowledgeGuides.map(g => ({
          id: g.id,
          title: g.title,
          slug: g.slug,
          description: g.description,
          content: g.content,
          category: g.category,
          learning_path: g.learningPath,
          difficulty: g.difficulty,
          duration_minutes: g.durationMinutes || 10,
          related_article_ids: g.relatedArticleIds || [],
          related_tool_ids: g.relatedToolIds || []
        }));

        const { error } = await client.from('knowledge_guides').upsert(formattedGuides);
        if (error) throw new Error(`Knowledge Guides sync failed: ${error.message}`);
        syncedCount.knowledge_guides = formattedGuides.length;
      }

      // 11. Sync Reading Sessions
      if (localData.readingSessions && localData.readingSessions.length > 0) {
        const formattedSessions = localData.readingSessions.map(s => ({
          id: s.id,
          reader_email: s.readerEmail,
          article_id: s.articleId,
          scroll_depth: s.scrollDepth || 0,
          completed: s.completed,
          engagement_time_seconds: s.engagementTimeSeconds || 0,
          timestamp: s.timestamp
        }));

        const { error } = await client.from('reading_sessions').upsert(formattedSessions);
        if (error) throw new Error(`Reading Sessions sync failed: ${error.message}`);
        syncedCount.reading_sessions = formattedSessions.length;
      }

      // 12. Sync Search Queries
      if (localData.searchQueries && localData.searchQueries.length > 0) {
        const formattedQueries = localData.searchQueries.map(q => ({
          query: q.query,
          count: q.count || 1,
          last_searched_at: q.lastSearchedAt || new Date().toISOString()
        }));

        const { error } = await client.from('search_queries').upsert(formattedQueries);
        if (error) throw new Error(`Search Queries sync failed: ${error.message}`);
        syncedCount.search_queries = formattedQueries.length;
      }

    } catch (e: any) {
      console.error("Supabase sync error:", e);
      return {
        success: false,
        message: `Sync interrupted: ${e.message}`,
        syncedCount
      };
    }

    return {
      success: true,
      message: "Successfully synchronized all local JSON seeds and user records to Supabase!",
      syncedCount
    };
  },

  // Helper to map DB record back to Article interface
  mapArticle(dbArt: any): Article {
    return {
      id: dbArt.id,
      title: dbArt.title,
      slug: dbArt.slug,
      summary: dbArt.summary || '',
      content: dbArt.content,
      category: dbArt.category,
      tags: dbArt.tags || [],
      authorId: dbArt.author_id,
      authorName: dbArt.author_name,
      authorAvatar: dbArt.author_avatar,
      authorRole: dbArt.author_role,
      status: dbArt.status || 'draft',
      featuredImage: dbArt.featured_image || '',
      publishedAt: dbArt.published_at,
      viewsCount: dbArt.views_count || 0,
      likesCount: dbArt.likes_count || 0,
      readTime: dbArt.read_time || '5 min read',
      seoTitle: dbArt.seo_title,
      seoDescription: dbArt.seo_description,
      isPillar: dbArt.is_pillar || false,
      workflowState: dbArt.workflow_state || 'Draft',
      assignedAuthor: dbArt.assigned_author,
      assignedEditor: dbArt.assigned_editor,
      dueDate: dbArt.due_date,
      editorialNotes: dbArt.editorial_notes,
      taskChecklist: dbArt.task_checklist || [],
      activityHistory: dbArt.activity_history || [],
      revisions: dbArt.revisions || []
    };
  },

  // Article APIs
  async getArticles(): Promise<Article[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(this.mapArticle);
    } catch (e) {
      console.error("Supabase getArticles failed, falling back to local:", e);
      return null;
    }
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      // First fetch the article
      const { data, error } = await client
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      const mapped = this.mapArticle(data);
      
      // Increment views
      await client
        .from('articles')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);
      
      mapped.viewsCount += 1;
      return mapped;
    } catch (e) {
      console.error("Supabase getArticleBySlug failed:", e);
      return null;
    }
  },

  async saveArticle(art: Article): Promise<Article | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const dbRecord = {
        id: art.id,
        title: art.title,
        slug: art.slug,
        summary: art.summary,
        content: art.content,
        category: art.category,
        tags: art.tags || [],
        author_id: art.authorId,
        author_name: art.authorName,
        author_avatar: art.authorAvatar,
        author_role: art.authorRole,
        status: art.status,
        featured_image: art.featuredImage,
        published_at: art.publishedAt,
        views_count: art.viewsCount || 0,
        likes_count: art.likesCount || 0,
        read_time: art.readTime,
        seo_title: art.seoTitle,
        seo_description: art.seoDescription,
        is_pillar: art.isPillar || false,
        workflow_state: art.workflowState || 'Draft',
        assigned_author: art.assignedAuthor,
        assigned_editor: art.assignedEditor,
        due_date: art.dueDate,
        editorial_notes: art.editorialNotes,
        task_checklist: art.taskChecklist || [],
        activity_history: art.activityHistory || [],
        revisions: art.revisions || []
      };

      const { error } = await client
        .from('articles')
        .upsert(dbRecord);
      
      if (error) throw error;
      return art;
    } catch (e) {
      console.error("Supabase saveArticle failed:", e);
      return null;
    }
  },

  async deleteArticle(id: string): Promise<boolean | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { error } = await client
        .from('articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase deleteArticle failed:", e);
      return null;
    }
  },

  // Comments
  async getComments(articleId: string): Promise<Comment[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(c => ({
        id: c.id,
        articleId: c.article_id,
        authorName: c.author_name,
        authorAvatar: c.author_avatar,
        content: c.content,
        createdAt: c.created_at,
        approved: c.approved
      }));
    } catch (e) {
      console.error("Supabase getComments failed:", e);
      return null;
    }
  },

  async addComment(c: Comment): Promise<Comment | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { error } = await client
        .from('comments')
        .insert({
          id: c.id,
          article_id: c.articleId,
          author_name: c.authorName,
          author_avatar: c.authorAvatar,
          content: c.content,
          created_at: c.createdAt,
          approved: c.approved !== false
        });
      if (error) throw error;
      return c;
    } catch (e) {
      console.error("Supabase addComment failed:", e);
      return null;
    }
  },

  // Subscribers
  async getSubscribers(): Promise<Subscriber[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(s => ({
        email: s.email,
        status: s.status,
        subscribedAt: s.subscribed_at,
        preferences: s.preferences || []
      }));
    } catch (e) {
      console.error("Supabase getSubscribers failed:", e);
      return null;
    }
  },

  async subscribe(email: string, preferences: string[] = []): Promise<Subscriber | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const newSub = {
        email,
        status: 'subscribed',
        subscribed_at: new Date().toISOString(),
        preferences
      };

      const { error } = await client
        .from('subscribers')
        .upsert(newSub);
      
      if (error) throw error;
      return {
        email: newSub.email,
        status: newSub.status as 'subscribed' | 'unsubscribed',
        subscribedAt: newSub.subscribed_at,
        preferences: newSub.preferences
      };
    } catch (e) {
      console.error("Supabase subscribe failed:", e);
      return null;
    }
  },

  // Resources
  async getResources(): Promise<Resource[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('resources')
        .select('*')
        .order('downloads_count', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        type: r.type,
        fileUrl: r.file_url,
        downloadsCount: r.downloads_count || 0,
        author: r.author || '',
        fileSize: r.file_size || ''
      }));
    } catch (e) {
      console.error("Supabase getResources failed:", e);
      return null;
    }
  },

  async incrementDownload(resourceId: string): Promise<Resource | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      // Get current download count
      const { data, error } = await client
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      const updatedCount = (data.downloads_count || 0) + 1;
      await client
        .from('resources')
        .update({ downloads_count: updatedCount })
        .eq('id', resourceId);

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        type: data.type,
        fileUrl: data.file_url,
        downloadsCount: updatedCount,
        author: data.author || '',
        fileSize: data.file_size || ''
      };
    } catch (e) {
      console.error("Supabase incrementDownload failed:", e);
      return null;
    }
  },

  // AI Tools
  async getTools(): Promise<AITool[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('ai_tools')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        category: t.category,
        rating: Number(t.rating) || 5.0,
        pricingType: t.pricing_type,
        url: t.url || '',
        features: t.features || [],
        affiliateUrl: t.affiliate_url || '',
        logoUrl: t.logo_url || '',
        alternatives: t.alternatives || [],
        reviews: t.reviews || []
      }));
    } catch (e) {
      console.error("Supabase getTools failed:", e);
      return null;
    }
  },

  async addToolReview(toolId: string, review: { author: string; rating: number; content: string }): Promise<AITool | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('ai_tools')
        .select('*')
        .eq('id', toolId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      const reviews = data.reviews || [];
      const newReview = {
        ...review,
        date: new Date().toISOString().split('T')[0]
      };
      reviews.unshift(newReview);

      const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      const newRating = parseFloat((sum / reviews.length).toFixed(1));

      const { error: updateError } = await client
        .from('ai_tools')
        .update({ reviews, rating: newRating })
        .eq('id', toolId);
      
      if (updateError) throw updateError;

      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category,
        rating: newRating,
        pricingType: data.pricing_type,
        url: data.url || '',
        features: data.features || [],
        affiliateUrl: data.affiliate_url || '',
        logoUrl: data.logo_url || '',
        alternatives: data.alternatives || [],
        reviews
      };
    } catch (e) {
      console.error("Supabase addToolReview failed:", e);
      return null;
    }
  },

  // Topic Clusters
  async getClusters(): Promise<TopicCluster[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('topic_clusters')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        pillarArticleId: c.pillar_article_id,
        featuredArticleIds: c.featured_article_ids || [],
        recommendedResourceIds: c.recommended_resource_ids || [],
        relatedToolIds: c.related_tool_ids || []
      }));
    } catch (e) {
      console.error("Supabase getClusters failed:", e);
      return null;
    }
  },

  async getClusterBySlug(slug: string): Promise<TopicCluster | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('topic_clusters')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        pillarArticleId: data.pillar_article_id,
        featuredArticleIds: data.featured_article_ids || [],
        recommendedResourceIds: data.recommended_resource_ids || [],
        relatedToolIds: data.related_tool_ids || []
      };
    } catch (e) {
      console.error("Supabase getClusterBySlug failed:", e);
      return null;
    }
  },

  async saveCluster(c: TopicCluster): Promise<TopicCluster | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const dbRecord = {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        pillar_article_id: c.pillarArticleId,
        featured_article_ids: c.featuredArticleIds || [],
        recommended_resource_ids: c.recommendedResourceIds || [],
        related_tool_ids: c.relatedToolIds || []
      };

      const { error } = await client
        .from('topic_clusters')
        .upsert(dbRecord);
      
      if (error) throw error;
      return c;
    } catch (e) {
      console.error("Supabase saveCluster failed:", e);
      return null;
    }
  },

  // Reader Profile
  async getReaderProfile(email: string): Promise<ReaderProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const emailKey = email.toLowerCase();
      const { data, error } = await client
        .from('reader_profiles')
        .select('*')
        .eq('email', emailKey)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        // Create new profile
        const newProf = {
          email: emailKey,
          bookmarks: [],
          reading_history: [],
          streak_count: 0,
          reading_goal_minutes_per_day: 10,
          display_name: emailKey.split('@')[0],
          role: 'registered',
          bio: ''
        };
        await client.from('reader_profiles').insert(newProf);
        return {
          email: newProf.email,
          bookmarks: [],
          readingHistory: [],
          streakCount: 0,
          readingGoalMinutesPerDay: 10,
          displayName: newProf.display_name,
          role: 'registered',
          bio: ''
        };
      }

      return {
        email: data.email,
        bookmarks: data.bookmarks || [],
        readingHistory: data.reading_history || [],
        streakCount: data.streak_count || 0,
        lastActiveDate: data.last_active_date,
        readingGoalMinutesPerDay: data.reading_goal_minutes_per_day || 10,
        displayName: data.display_name,
        role: data.role || 'registered',
        bio: data.bio || ''
      };
    } catch (e) {
      console.error("Supabase getReaderProfile failed:", e);
      return null;
    }
  },

  async saveReaderProfile(profile: ReaderProfile): Promise<ReaderProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const dbRecord = {
        email: profile.email.toLowerCase(),
        bookmarks: profile.bookmarks || [],
        reading_history: profile.readingHistory || [],
        streak_count: profile.streakCount || 0,
        last_active_date: profile.lastActiveDate,
        reading_goal_minutes_per_day: profile.readingGoalMinutesPerDay || 10,
        display_name: (profile as any).displayName || '',
        role: (profile as any).role || 'registered',
        bio: (profile as any).bio || ''
      };

      const { error } = await client
        .from('reader_profiles')
        .upsert(dbRecord);
      
      if (error) throw error;
      return profile;
    } catch (e) {
      console.error("Supabase saveReaderProfile failed:", e);
      return null;
    }
  },

  // Knowledge Base Guides
  async getGuides(): Promise<KnowledgeHubGuide[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('knowledge_guides')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(g => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        description: g.description || '',
        content: g.content,
        category: g.category,
        learningPath: g.learning_path || '',
        difficulty: g.difficulty || 'Beginner',
        durationMinutes: g.duration_minutes || 10,
        relatedArticleIds: g.related_article_ids || [],
        relatedToolIds: g.related_tool_ids || []
      }));
    } catch (e) {
      console.error("Supabase getGuides failed:", e);
      return null;
    }
  },

  async getGuideBySlug(slug: string): Promise<KnowledgeHubGuide | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('knowledge_guides')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        content: data.content,
        category: data.category,
        learningPath: data.learning_path || '',
        difficulty: data.difficulty || 'Beginner',
        durationMinutes: data.duration_minutes || 10,
        relatedArticleIds: data.related_article_ids || [],
        relatedToolIds: data.related_tool_ids || []
      };
    } catch (e) {
      console.error("Supabase getGuideBySlug failed:", e);
      return null;
    }
  }
};
