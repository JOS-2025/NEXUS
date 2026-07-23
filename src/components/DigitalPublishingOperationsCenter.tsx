import React from 'react';
import { 
  LayoutDashboard, FileText, Calendar, Sparkles, BookOpen, Image, Mail, 
  MessageSquare, Users, BarChart3, DollarSign, ScrollText, Settings, Search, 
  Bell, Plus, Trash2, Edit, CheckCircle2, AlertTriangle, Globe, Smartphone, 
  Laptop, ChevronRight, Copy, MoreHorizontal, Filter, ArrowUpRight, Lock, 
  RefreshCw, Check, X, FolderOpen, Send, Shield, Activity, HelpCircle, Eye, Heart,
  Database
} from 'lucide-react';
import { Article, AITool, Resource, KnowledgeHubGuide, Comment, Subscriber } from '../types';
import PublishingAssistantDashboard from './PublishingAssistantDashboard';
import SettingsDashboard from './SettingsDashboard';
import AdminNotificationPanel from './AdminNotificationPanel';

interface DigitalPublishingOperationsCenterProps {
  userRole: 'anonymous' | 'registered' | 'author' | 'editor' | 'admin';
  articles: Article[];
  onRefreshArticles: () => void;
  onSetTab?: (tab: string) => void;
}

export default function DigitalPublishingOperationsCenter({
  userRole,
  articles,
  onRefreshArticles,
  onSetTab
}: DigitalPublishingOperationsCenterProps) {
  if (userRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="inline-flex p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full shadow-inner animate-bounce">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-sans font-extrabold text-xl text-white">Ops Center Restricted</h2>
          <p className="font-sans text-xs text-slate-400 leading-relaxed">
            The Digital Publishing Operations Center is restricted. Only designated administrators have clearance to sync database configurations, review audit trails, or run bulk operations.
          </p>
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl mt-4">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">Access Status:</span>
            <p className="text-[11px] text-indigo-400 font-semibold leading-normal">
              Sign in with an authorized <strong>Administrator account</strong> (detected directly from the database) to gain access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation & Sub-views State
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');
  
  // Search & Filtering State
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [contentSearch, setContentSearch] = React.useState('');
  const [contentCategory, setContentCategory] = React.useState('all');
  const [contentStatus, setContentStatus] = React.useState('all');
  const [selectedArticles, setSelectedArticles] = React.useState<string[]>([]);
  
  // Form Editor Modal state
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingArticle, setEditingArticle] = React.useState<Partial<Article> | null>(null);

  // Entities state
  const [aiTools, setAiTools] = React.useState<AITool[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [guides, setGuides] = React.useState<KnowledgeHubGuide[]>([]);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [metrics, setMetrics] = React.useState<any>(null);
  
  // UI states
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([
    { id: 1, title: 'New Newsletter Subscriber', desc: 'johndoe@example.com just subscribed.', time: '2 mins ago', read: false },
    { id: 2, title: 'AI Generation Complete', desc: 'Social post suggestions ready for review.', time: '10 mins ago', read: false },
    { id: 3, title: 'Flagged Comment Moderated', desc: 'A comment on "AI SaaSsolopreneur" was flagged.', time: '1 hour ago', read: true }
  ]);
  const [isQuickActionOpen, setIsQuickActionOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [auditFilter, setAuditFilter] = React.useState('all');

  // AI Studio specific state
  const [aiTask, setAiTask] = React.useState<'topic' | 'outline' | 'titles' | 'seo' | 'tone' | 'newsletter'>('topic');
  const [aiInput, setAiInput] = React.useState('');
  const [aiOutput, setAiOutput] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);

  // Newsletter specific builder state
  const [newsSubject, setNewsSubject] = React.useState('Weekly Nexus Digest: AI Frontier & Growth Playbooks');
  const [newsContent, setNewsContent] = React.useState('Hi there! In this edition we cover the evolution of large language models and building AI micro-SaaS businesses...');
  const [campaignSentCount, setCampaignSentCount] = React.useState(0);

  // CRUD Forms State
  const [currentEntityEditing, setCurrentEntityEditing] = React.useState<{type: 'tool' | 'resource' | 'guide', data: any} | null>(null);

  // Media manager simulation
  const [mediaList, setMediaList] = React.useState<any[]>([
    { id: 1, name: 'transformers_header.jpg', size: '420 KB', type: 'image/jpeg', tags: ['AI', 'Pillar'], alt: 'Evolution of LLMs visual diagram' },
    { id: 2, name: 'microsaas_blueprint.pdf', size: '1.2 MB', type: 'application/pdf', tags: ['SaaS', 'Resource'], alt: 'Micro-SaaS blueprint architecture flow' },
    { id: 3, name: 'productivity_cheatsheet.png', size: '210 KB', type: 'image/png', tags: ['Productivity'], alt: 'Task checklist guide' }
  ]);
  const [compressionLogs, setCompressionLogs] = React.useState<string[]>([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = React.useState<any[]>([
    { id: 1, timestamp: '2026-07-08T11:32:00Z', user: 'Global Admin', action: 'Login', entity: 'Session', details: 'Successful login from IP 192.168.1.1' },
    { id: 2, timestamp: '2026-07-08T11:15:00Z', user: 'Global Admin', action: 'Update Settings', entity: 'General', details: 'Updated general brand name metadata' },
    { id: 3, timestamp: '2026-07-08T10:45:00Z', user: 'Sarah Chen', action: 'Publish Article', entity: 'Article', details: 'Published "The Evolution of LLMs"' },
    { id: 4, timestamp: '2026-07-08T09:12:00Z', user: 'Site Editor', action: 'Role Update', entity: 'User', details: 'Granted writer role to user' }
  ]);

  // Settings State
  const [siteSettings, setSiteSettings] = React.useState({
    brandName: 'NEXUS',
    seoDefaultTitle: 'Nexus AI Publishing Hub',
    seoDefaultDesc: 'Latest insights into Artificial Intelligence, Productivity, and Entrepreneurship',
    maintenanceMode: false,
    enableAIRecommendation: true,
    geminiModel: 'gemini-3.5-flash',
    apiKey: '••••••••••••••••••••••••'
  });

  // Supabase Integration States
  const [supabaseStatus, setSupabaseStatus] = React.useState<any>(null);
  const [supabaseLoading, setSupabaseLoading] = React.useState<boolean>(false);
  const [syncStatus, setSyncStatus] = React.useState<string>('');
  const [syncLoading, setSyncLoading] = React.useState<boolean>(false);
  const [sqlSchema, setSqlSchema] = React.useState<string>('');
  const [copiedSchema, setCopiedSchema] = React.useState<boolean>(false);

  // Custom Inline Modals Overlay States
  const [confirmState, setConfirmState] = React.useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [alertState, setAlertState] = React.useState<{
    show: boolean;
    title: string;
    message: string;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      }
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertState({
      show: true,
      title,
      message
    });
  };

  // Fetch helper
  const loadEntities = async () => {
    setLoading(true);
    try {
      const [toolsRes, resRes, guidesRes, usersRes, metricsRes] = await Promise.all([
        fetch('/api/ai-tools').then(r => r.json()),
        fetch('/api/resources').then(r => r.json()),
        fetch('/api/guides').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/analytics/dashboard').then(r => r.json())
      ]);

      setAiTools(toolsRes || []);
      setResources(resRes || []);
      setGuides(guidesRes || []);
      setUsersList(usersRes || []);
      setMetrics(metricsRes || []);
      
      // Load comments of first few articles for moderation seed
      if (articles.length > 0) {
        const commentsArr: Comment[] = [];
        for (const art of articles.slice(0, 3)) {
          const cRes = await fetch(`/api/articles/${art.id}/comments`);
          if (cRes.ok) {
            const data = await cRes.json();
            commentsArr.push(...data);
          }
        }
        setComments(commentsArr);
      }

      // Fetch Supabase status
      try {
        const supRes = await fetch('/api/supabase/status');
        if (supRes.ok) {
          const statusData = await supRes.json();
          setSupabaseStatus(statusData);
        }
      } catch (e) {
        console.error("Failed to fetch Supabase status:", e);
      }

      // Fetch SQL Schema script
      try {
        const sqlRes = await fetch('/api/supabase/sql');
        if (sqlRes.ok) {
          const data = await sqlRes.json();
          setSqlSchema(data.sql || '');
        }
      } catch (e) {
        console.error("Failed to fetch SQL schema:", e);
      }
    } catch (err) {
      console.error("Could not fetch entities:", err);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setSupabaseLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
        logAuditAction('Test Connection', 'Supabase', `Tested connection to Supabase. Result: ${data.connected ? 'Connected' : 'Not Connected'}`);
      } else {
        triggerAlert("Connection Failed", "Failed to query connection status from API.");
      }
    } catch (err: any) {
      triggerAlert("Connection Error", err.message || "An unexpected connection error occurred.");
    } finally {
      setSupabaseLoading(false);
    }
  };

  const runSupabaseSync = async () => {
    triggerConfirm(
      "Synchronize Database Content",
      "Are you sure you want to synchronize all local data to Supabase? This will write all local articles, categories, subscribers, AI tools, resources, and user profiles to your live database tables.",
      async () => {
        setSyncLoading(true);
        setSyncStatus('Initiating data synchronization...');
        try {
          const res = await fetch('/api/supabase/sync', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setSyncStatus(`Sync successful! Migrated ${data.articlesMigrated || 0} articles, ${data.subscribersMigrated || 0} newsletter subscribers, ${data.resourcesMigrated || 0} resources, ${data.aiToolsMigrated || 0} AI tools, ${data.knowledgeGuidesMigrated || 0} knowledge guides, and ${data.readerProfilesMigrated || 0} reader profiles.`);
              logAuditAction('Sync Database', 'Supabase', `Synchronized all local schemas to Supabase live tables.`);
              // Refresh lists
              loadEntities();
            } else {
              setSyncStatus(`Sync failed: ${data.message || data.error || 'Unknown server error'}`);
            }
          } else {
            setSyncStatus('Sync request failed at server API route level.');
          }
        } catch (err: any) {
          setSyncStatus(`Error during synchronization: ${err.message}`);
        } finally {
          setSyncLoading(false);
        }
      }
    );
  };

  React.useEffect(() => {
    loadEntities();
  }, [articles]);

  // Bulk actions
  const handleBulkAction = async (action: 'Published' | 'Idea' | 'Draft' | 'delete' | 'Archived') => {
    if (selectedArticles.length === 0) return;
    try {
      if (action === 'delete') {
        await Promise.all(selectedArticles.map(id => fetch(`/api/articles/${id}`, { method: 'DELETE' })));
      } else {
        await fetch('/api/admin/articles/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedArticles, action: 'workflowState', value: action })
        });
      }
      setSelectedArticles([]);
      onRefreshArticles();
      logAuditAction('Bulk Edit', 'Articles', `Bulk updated ${selectedArticles.length} articles to state: ${action}`);
    } catch (err) {
      console.error(err);
    }
  };

  const logAuditAction = (action: string, entity: string, details: string) => {
    const newLog = {
      id: auditLogs.length + 1,
      timestamp: new Date().toISOString(),
      user: 'Global Admin',
      action,
      entity,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // AI Generation helpers
  const handleAiCall = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiOutput('');
    try {
      let endpoint = '/api/ai/summarize';
      let payload: any = { content: aiInput };
      
      if (aiTask === 'titles') {
        endpoint = '/api/ai/title-suggestions';
        payload = { topic: aiInput };
      } else if (aiTask === 'seo') {
        endpoint = '/api/ai/seo-assistant';
        payload = { content: aiInput, keywords: [] };
      } else if (aiTask === 'outline') {
        endpoint = '/api/ai/content-outline';
        payload = { topic: aiInput };
      } else if (aiTask === 'tone') {
        endpoint = '/api/ai/tone-check';
        payload = { content: aiInput, targetTone: 'professional' };
      } else if (aiTask === 'newsletter') {
        endpoint = '/api/ai/social-captions'; // Proxy for text builder
        payload = { articleTitle: aiInput };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.summary) setAiOutput(data.summary);
      else if (data.suggestions) setAiOutput(Array.isArray(data.suggestions) ? data.suggestions.join('\n') : JSON.stringify(data.suggestions, null, 2));
      else if (data.outline) setAiOutput(data.outline);
      else if (data.captions) setAiOutput(Array.isArray(data.captions) ? data.captions.join('\n\n') : JSON.stringify(data.captions));
      else if (data.analysis) setAiOutput(`Analysis Results:\n\n${JSON.stringify(data.analysis, null, 2)}`);
      else setAiOutput(data.text || JSON.stringify(data, null, 2));

      logAuditAction('AI Operation', 'AI Studio', `Ran AI workflow: ${aiTask}`);
    } catch (err: any) {
      setAiOutput(`Failed to execute AI request: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Article Edit Submit
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      const isNew = !editingArticle.id;
      const url = isNew ? '/api/articles' : `/api/articles`;
      const payload = {
        ...editingArticle,
        // Ensure defaults
        workflowState: editingArticle.workflowState || 'Idea',
        status: editingArticle.workflowState === 'Published' ? 'published' : 'draft',
        revisions: editingArticle.revisions || [],
        tags: Array.isArray(editingArticle.tags) ? editingArticle.tags : []
      };
      const res = await fetch(url, {
        method: 'POST', // Handled by server.ts router as UPSERT or create
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingArticle(null);
        onRefreshArticles();
        logAuditAction(isNew ? 'Create Article' : 'Update Article', 'Article', `Saved article title: "${payload.title}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string) => {
    triggerConfirm(
      "Delete Article",
      "Are you sure you want to delete this article permanently? This action cannot be undone.",
      async () => {
        try {
          const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
          if (res.ok) {
            onRefreshArticles();
            logAuditAction('Delete Article', 'Article', `Deleted article ${id}`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  // Manage Entities (AI Tool, Resource, Guide CRUD)
  const handleEntitySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntityEditing) return;
    const { type, data } = currentEntityEditing;
    try {
      const isNew = !data.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `/api/admin/${type}s` : `/api/admin/${type}s/${data.id}`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setCurrentEntityEditing(null);
        loadEntities();
        logAuditAction(isNew ? `Create ${type}` : `Update ${type}`, type, `Saved entity "${data.name || data.title}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEntityDelete = async (type: 'tool' | 'resource' | 'guide', id: string) => {
    triggerConfirm(
      `Delete ${type === 'tool' ? 'AI Tool' : type === 'resource' ? 'Resource' : 'Guide'}`,
      `Are you sure you want to delete this ${type} listing permanently?`,
      async () => {
        try {
          const res = await fetch(`/api/admin/${type}s/${id}`, { method: 'DELETE' });
          if (res.ok) {
            loadEntities();
            logAuditAction(`Delete ${type}`, type, `Deleted ${type} ${id}`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  // Newsletter action
  const handleSendCampaign = () => {
    setCampaignSentCount(metrics?.subscribersCount || subscribers.length || 180);
    logAuditAction('Send Campaign', 'Newsletter', `Dispatched newsletter campaign: "${newsSubject}"`);
    triggerAlert("Campaign Dispatched", `Successfully dispatched newsletter campaign to ${metrics?.subscribersCount || subscribers.length || 180} active subscribers.`);
  };

  // Moderate comment
  const handleModerateComment = async (id: string) => {
    triggerConfirm(
      "Moderate Comment",
      "Are you sure you want to delete this comment permanently from moderation lists?",
      async () => {
        try {
          const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setComments(prev => prev.filter(c => c.id !== id));
            logAuditAction('Moderate Comment', 'Comment', `Moderated comment ${id}`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  // User management operations
  const handleSaveUser = async (userObj: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
      });
      if (res.ok) {
        loadEntities();
        logAuditAction('Update User', 'User', `Saved user profile: ${userObj.email}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (email: string) => {
    triggerConfirm(
      "Remove User",
      `Are you sure you want to remove the simulated user profile for ${email}?`,
      async () => {
        try {
          const res = await fetch(`/api/admin/users/${email}`, { method: 'DELETE' });
          if (res.ok) {
            loadEntities();
            logAuditAction('Delete User', 'User', `Removed user: ${email}`);
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  // Compression simulator
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newMedia = {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type,
        tags: ['New Upload'],
        alt: `Alt description for ${file.name}`
      };
      setMediaList(prev => [newMedia, ...prev]);
      
      // Compression log
      const initialSize = file.size / 1024;
      const savings = initialSize * 0.42; // Simulated 42% web optimization
      setCompressionLogs(prev => [
        `Compressed ${file.name}: Saved ${savings.toFixed(0)} KB (42% optimization)`,
        ...prev
      ]);
      logAuditAction('Media Upload', 'Media', `Uploaded and compressed "${file.name}"`);
    }
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.action.toLowerCase().includes(auditFilter.toLowerCase()) || 
           log.entity.toLowerCase().includes(auditFilter.toLowerCase());
  });

  // KPI Calculations
  const dashboardKPIs = [
    { label: 'Total Articles', val: articles.length, change: '+4% this mo', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Draft Articles', val: articles.filter(a => a.workflowState !== 'Published').length, change: 'Editorial backlog', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Published Articles', val: articles.filter(a => a.workflowState === 'Published').length, change: 'Active in production', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Total Traffic Views', val: metrics?.totalViews || 2400, change: '+12.5% telemetry', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Newsletter Members', val: metrics?.subscribersCount || 180, change: 'Growth trend +8%', color: 'bg-teal-50 text-teal-600 border-teal-100' },
    { label: 'Resource Downloads', val: metrics?.totalDownloads || 122, change: 'Engagement metrics', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { label: 'Affiliate Gross Revenue', val: metrics?.revenueMetrics?.totalRevenue || '$1,820.00', change: 'Ecosystem yield', color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Pending Comments', val: comments.length || 5, change: 'Requires moderation', color: 'bg-orange-50 text-orange-600 border-orange-100' }
  ];

  // Calendar setup - Current Month (July 2026 as per local metadata)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row border-t border-slate-800">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm tracking-tight text-white leading-none">Nexus Console</h2>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400">OPS CENTER v3.1</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
            { id: 'content', label: 'Content Management', icon: FileText },
            { id: 'workflow', label: 'Editorial Kanban', icon: Shield },
            { id: 'calendar', label: 'Editorial Calendar', icon: Calendar },
            { id: 'aistudio', label: 'AI Operations Suite', icon: Sparkles },
            { id: 'assistant', label: 'AI Publishing Assistant', icon: Sparkles },
            { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
            { id: 'media', label: 'Media Library', icon: Image },
            { id: 'newsletter', label: 'Newsletter campaigns', icon: Mail },
            { id: 'notifications', label: 'Audience Engagement', icon: Bell },
            { id: 'community', label: 'Community & Comments', icon: MessageSquare },
            { id: 'users', label: 'User Governance', icon: Users },
            { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
            { id: 'monetization', label: 'Monetization Hub', icon: DollarSign },
            { id: 'audit', label: 'Security Audit Logs', icon: ScrollText },
            { id: 'supabase', label: 'Supabase Database', icon: Database },
            { id: 'settings', label: 'Central Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'analytics' && onSetTab) {
                    // Back compatibility fallback trigger
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active 
                    ? 'bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500 shadow-xs' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center font-mono font-black text-indigo-400 text-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">josphatmuchemi976</span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block leading-none">ADMINISTRATOR</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
          
          {/* Global Admin Search */}
          <div className="relative w-72 max-w-full hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Instant Global Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {globalSearch && (
              <div className="absolute top-11 left-0 w-full bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 text-xs text-left max-h-60 overflow-y-auto">
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Query matches:</span>
                {articles.filter(a => a.title.toLowerCase().includes(globalSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => { setActiveTab('content'); setGlobalSearch(''); }} className="p-1.5 hover:bg-indigo-950/40 rounded-lg cursor-pointer truncate font-medium text-slate-300">
                    📰 Article: {a.title}
                  </div>
                ))}
                {aiTools.filter(t => t.name.toLowerCase().includes(globalSearch.toLowerCase())).map(t => (
                  <div key={t.id} onClick={() => { setActiveTab('knowledge'); setGlobalSearch(''); }} className="p-1.5 hover:bg-indigo-950/40 rounded-lg cursor-pointer truncate font-medium text-slate-300">
                    🛠️ Tool: {t.name}
                  </div>
                ))}
                {resources.filter(r => r.title.toLowerCase().includes(globalSearch.toLowerCase())).map(r => (
                  <div key={r.id} onClick={() => { setActiveTab('knowledge'); setGlobalSearch(''); }} className="p-1.5 hover:bg-indigo-950/40 rounded-lg cursor-pointer truncate font-medium text-slate-300">
                    📁 Resource: {r.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Quick action button */}
            <div className="relative">
              <button 
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md shadow-indigo-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Actions</span>
              </button>
              {isQuickActionOpen && (
                <div className="absolute right-0 top-9 w-52 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1 text-left">
                  <button onClick={() => { setEditingArticle({}); setIsEditModalOpen(true); setIsQuickActionOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-xl flex items-center space-x-2 text-slate-300 hover:text-white">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Create New Article</span>
                  </button>
                  <button onClick={() => { setCurrentEntityEditing({ type: 'tool', data: {} }); setIsQuickActionOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-xl flex items-center space-x-2 text-slate-300 hover:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>List AI Tool</span>
                  </button>
                  <button onClick={() => { setCurrentEntityEditing({ type: 'resource', data: {} }); setIsQuickActionOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-xl flex items-center space-x-2 text-slate-300 hover:text-white">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Upload Resource</span>
                  </button>
                  <button onClick={() => { setActiveTab('newsletter'); setIsQuickActionOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-900 rounded-xl flex items-center space-x-2 text-slate-300 hover:text-white">
                    <Mail className="w-3.5 h-3.5 text-teal-500" />
                    <span>Write Newsletter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Center */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="relative p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[9px] font-black rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 top-11 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-white">Notifications</span>
                    <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[10px] font-bold text-indigo-400 hover:underline">Mark all read</button>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2 rounded-xl border ${n.read ? 'bg-slate-950/40 border-transparent' : 'bg-indigo-950/20 border-indigo-900/30'} space-y-1`}>
                        <div className="flex justify-between">
                          <span className="font-bold text-xs text-slate-200">{n.title}</span>
                          <span className="text-[8px] font-mono text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-right hidden lg:block">
              <span className="text-[10px] font-mono text-slate-500 block">SYSTEM TIME</span>
              <span className="text-xs font-bold font-mono text-indigo-400">2026-07-08 11:45 UTC</span>
            </div>

          </div>
        </header>

        {/* WORKSPACE VIEWS CONTAINER */}
        <main className="p-6 md:p-8 flex-1 space-y-8">
          
          {loading && (
            <div className="flex items-center justify-center space-x-2 bg-slate-950/55 p-4 rounded-2xl border border-slate-800">
              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-400">Syncing with database telemetry...</span>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 1: EXECUTIVE DASHBOARD HOME
              ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>Executive Overview</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full font-mono uppercase tracking-widest animate-pulse">ACTIVE COHORT</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Real-time analytics and publication workflow pipelines for the entire Nexus platform.
                </p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardKPIs.map((kpi, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 shadow-md hover:border-indigo-500/30 transition-all flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block leading-none mb-2">{kpi.label}</span>
                    <div className="flex items-baseline space-x-1.5 my-1">
                      <span className="text-xl md:text-2xl font-black text-white">{kpi.val}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 leading-none block mt-1">✓ {kpi.change}</span>
                  </div>
                ))}
              </div>

              {/* Dynamic Interactive SVG Charts Module */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Traffic Trend Chart */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      <span>Global Traffic & Readership Performance (30 Days)</span>
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">July cohort telemetry</span>
                  </div>
                  
                  {/* Visual CSS-based chart with data plots */}
                  <div className="h-44 flex items-end justify-between gap-1 pt-6 px-4 relative">
                    <div className="absolute inset-x-0 top-1/2 border-t border-slate-800/40 border-dashed"></div>
                    <div className="absolute left-0 top-1/4 text-[8px] font-mono text-slate-600">1,500 reads</div>
                    <div className="absolute left-0 top-3/4 text-[8px] font-mono text-slate-600">500 reads</div>
                    
                    {[35, 42, 60, 48, 55, 78, 85, 92, 110, 100, 120, 135, 142].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-slate-900 border border-indigo-500/30 text-white font-mono text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                          {(v * 10).toLocaleString()} reads
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 group-hover:to-violet-400 rounded-t-md transition-all duration-500" 
                          style={{ height: `${(v / 150) * 100}%` }}
                        ></div>
                        <span className="text-[8px] font-mono text-slate-600 mt-2">D{i * 2 + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories Breakdown */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                  <h3 className="font-sans font-bold text-sm text-white border-b border-slate-800/80 pb-4 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>Views by Category</span>
                  </h3>
                  <div className="space-y-3.5 pt-2">
                    {[
                      { cat: 'Artificial Intelligence', val: '58%', count: 1420, color: 'bg-indigo-500' },
                      { cat: 'Entrepreneurship', val: '22%', count: 980, color: 'bg-emerald-500' },
                      { cat: 'Productivity', val: '12%', count: 540, color: 'bg-amber-500' },
                      { cat: 'Technology', val: '8%', count: 320, color: 'bg-rose-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{item.cat}</span>
                          <span className="font-mono text-slate-500">{item.count} views ({item.val})</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: item.val }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Quick-Launch Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Activities Feed */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span>Recent Security & Audit Trail</span>
                  </h3>
                  <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto pr-1">
                    {auditLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{log.action} ({log.entity})</p>
                          <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{log.details}</p>
                          <span className="text-[10px] font-mono text-slate-500 block mt-1">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] rounded-md font-bold uppercase">
                          {log.user}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Workflow Tasks checklist */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Editorial Compliance Backlog</span>
                  </h3>
                  <div className="space-y-3 pt-2">
                    {[
                      { id: 1, text: 'Finalize SEO description for Transformers Pillar', done: true },
                      { id: 2, text: 'Run grammar and tone analysis on Micro-SaaS Guide', done: false },
                      { id: 3, text: 'Moderate comments and reported reviews backlog', done: false },
                      { id: 4, text: 'Approve scheduled newsletter draft for July campaign', done: false }
                    ].map(task => (
                      <div key={task.id} className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center border ${task.done ? 'bg-emerald-500 border-transparent text-slate-950' : 'border-slate-700 text-transparent'}`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className={`text-xs font-medium ${task.done ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              SUBVIEW 2: CONTENT MANAGEMENT TABLE
              ========================================== */}
          {activeTab === 'content' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5">
                <div>
                  <h1 className="text-2xl font-black text-white">Content Library Administration</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage publishing workflow state, edit content templates, and run bulk state transitions.
                  </p>
                </div>
                <button 
                  onClick={() => { setEditingArticle({}); setIsEditModalOpen(true); }} 
                  className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Publication</span>
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
                <div className="relative w-full md:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                  <select
                    value={contentCategory}
                    onChange={(e) => setContentCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Productivity">Productivity</option>
                  </select>

                  <select
                    value={contentStatus}
                    onChange={(e) => setContentStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Idea">Idea Block</option>
                  </select>

                  {/* Bulk Operations Buttons */}
                  {selectedArticles.length > 0 && (
                    <div className="flex items-center space-x-2 bg-indigo-950/40 px-3 py-1 border border-indigo-900/40 rounded-xl">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold mr-2">{selectedArticles.length} selected</span>
                      <button onClick={() => handleBulkAction('Published')} className="text-[10px] font-bold text-emerald-400 hover:underline">Publish</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={() => handleBulkAction('Draft')} className="text-[10px] font-bold text-amber-400 hover:underline">Draft</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={() => handleBulkAction('delete')} className="text-[10px] font-bold text-rose-400 hover:underline">Delete</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-3xl border border-slate-800 shadow-xl bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-widest text-[9px] font-black">
                      <th className="p-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedArticles.length === articles.length && articles.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedArticles(articles.map(a => a.id));
                            else setSelectedArticles([]);
                          }}
                        />
                      </th>
                      <th className="p-4">Headline / Details</th>
                      <th className="p-4">Workflow State</th>
                      <th className="p-4">Assigned Crew</th>
                      <th className="p-4 text-center">Views</th>
                      <th className="p-4 text-center">SEO Score</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {articles
                      .filter(a => {
                        const matchSearch = a.title.toLowerCase().includes(contentSearch.toLowerCase());
                        const matchCat = contentCategory === 'all' || a.category === contentCategory;
                        const matchStatus = contentStatus === 'all' || a.workflowState === contentStatus || a.status === contentStatus.toLowerCase();
                        return matchSearch && matchCat && matchStatus;
                      })
                      .map(art => {
                        const checked = selectedArticles.includes(art.id);
                        return (
                          <tr key={art.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  if (checked) setSelectedArticles(prev => prev.filter(id => id !== art.id));
                                  else setSelectedArticles(prev => [...prev, art.id]);
                                }}
                              />
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-200 text-sm block leading-tight">{art.title}</span>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                                <span className="font-semibold text-indigo-400">{art.category}</span>
                                <span>•</span>
                                <span>{art.readTime || '5 min read'}</span>
                                {art.isPillar && <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-bold rounded">PILLAR</span>}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase font-mono border ${
                                art.workflowState === 'Published' || art.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {art.workflowState || 'Idea'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-semibold text-slate-400">
                              <span>Auth: {art.assignedAuthor || 'Sarah Chen'}</span>
                              <span className="block text-[10px] text-slate-600">Ed: {art.assignedEditor || 'Site Editor'}</span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-slate-300">
                              {art.viewsCount || 0}
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-mono font-black text-emerald-400 text-xs bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                94%
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <button 
                                onClick={() => { setEditingArticle(art); setIsEditModalOpen(true); }}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                title="Edit Article"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteArticle(art.id)}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete Article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 3: EDITORIAL KANBAN BOARD
              ========================================== */}
          {activeTab === 'workflow' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Editorial Workflow Pipeline</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Drag, drop, or quickly transition publication workflow states across editorial columns.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { title: 'Idea Bank', state: 'Idea', color: 'border-slate-800 bg-slate-950/40 text-slate-400' },
                  { title: 'In Research / Outline', state: 'Outline', color: 'border-sky-800/40 bg-sky-950/5 text-sky-400' },
                  { title: 'Drafting Phase', state: 'Draft', color: 'border-amber-800/40 bg-amber-950/5 text-amber-400' },
                  { title: 'Editor & SEO Review', state: 'Editor Review', color: 'border-violet-800/40 bg-violet-950/5 text-violet-400' },
                  { title: 'Approved & Scheduled', state: 'Published', color: 'border-emerald-800/40 bg-emerald-950/5 text-emerald-400' }
                ].map(col => {
                  const colArticles = articles.filter(a => {
                    if (col.state === 'Published') return a.workflowState === 'Published' || a.status === 'published';
                    if (col.state === 'Idea') return !a.workflowState || a.workflowState === 'Idea';
                    return a.workflowState === col.state;
                  });
                  return (
                    <div key={col.state} className={`border rounded-3xl p-4 flex flex-col space-y-4 ${col.color}`}>
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                        <span className="font-bold text-xs tracking-wider uppercase">{col.title}</span>
                        <span className="font-mono text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded-full">{colArticles.length}</span>
                      </div>

                      <div className="flex-1 space-y-3 min-h-[400px]">
                        {colArticles.map(art => (
                          <div 
                            key={art.id} 
                            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-3 transition-all cursor-pointer group hover:border-slate-700"
                            onClick={() => { setEditingArticle(art); setIsEditModalOpen(true); }}
                          >
                            <span className="font-bold text-slate-200 text-xs block leading-snug group-hover:text-indigo-400">{art.title}</span>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span className="font-mono">SEO: 92%</span>
                              <span className="font-mono">{art.readTime || '5m'}</span>
                            </div>

                            {/* Move button to simulate progression */}
                            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px]">
                              <span className="text-slate-500">Crew: Chen</span>
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const nextStates: Record<string, string> = {
                                    'Idea': 'Outline',
                                    'Outline': 'Draft',
                                    'Draft': 'Editor Review',
                                    'Editor Review': 'Published',
                                    'Published': 'Idea'
                                  };
                                  const nextState = nextStates[art.workflowState || 'Idea'] || 'Idea';
                                  await fetch(`/api/articles/${art.id}/workflow`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ workflowState: nextState, status: nextState === 'Published' ? 'published' : 'draft' })
                                  });
                                  onRefreshArticles();
                                  logAuditAction('Progress State', 'Workflow', `Moved article "${art.title}" to state "${nextState}"`);
                                }} 
                                className="text-indigo-400 hover:text-indigo-300 font-black hover:underline"
                              >
                                Advance ➔
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 4: EDITORIAL CALENDAR
              ========================================== */}
          {activeTab === 'calendar' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">Editorial Publication Calendar</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Keep your content team synchronized by visual deadlines, due dates, and publishing slots.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 font-mono text-xs bg-indigo-950/40 border border-indigo-900/30 px-3 py-1.5 rounded-full text-indigo-400 font-bold">
                  🗓️ Current View: July 2026
                </div>
              </div>

              {/* Monthly Calendar Grid */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 pb-2">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                
                <div className="grid grid-cols-7 gap-3 h-[480px]">
                  {/* Skip padding days of June */}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={` June-${i}`} className="bg-slate-900/10 border border-slate-800/30 rounded-2xl opacity-20"></div>
                  ))}

                  {calendarDays.map(day => {
                    const dateStr = `2026-07-${day < 10 ? '0' + day : day}`;
                    const dayArticles = articles.filter(a => a.dueDate === dateStr);
                    return (
                      <div key={day} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-2 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                        <span className="font-mono text-xs font-black text-slate-500">{day}</span>
                        
                        <div className="flex-1 overflow-y-auto space-y-1.5 mt-1.5 pr-0.5">
                          {dayArticles.map(art => (
                            <div 
                              key={art.id} 
                              onClick={() => { setEditingArticle(art); setIsEditModalOpen(true); }}
                              className="p-1 rounded bg-indigo-600/15 border border-indigo-900/40 text-[10px] font-semibold text-indigo-300 truncate cursor-pointer hover:bg-indigo-600/25"
                              title={art.title}
                            >
                              {art.title}
                            </div>
                          ))}
                        </div>

                        {dayArticles.length === 0 && (
                          <button 
                            onClick={() => { setEditingArticle({ dueDate: dateStr }); setIsEditModalOpen(true); }} 
                            className="w-full text-center py-1 opacity-0 hover:opacity-100 text-[10px] text-indigo-400 font-bold block"
                          >
                            + Slot
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 5: AI OPERATIONS SUITE
              ========================================== */}
          {activeTab === 'aistudio' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">AI Studio Operations</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Orchestrate Gemini-backed content intelligence workflows. Select prompt engine, input topics, and deploy text assets.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Workflow select sidebar */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">PROMPT WORKFLOWS</span>
                  {[
                    { id: 'topic', label: 'Topic Research & Trends', desc: 'Identify knowledge gaps & competitive angles' },
                    { id: 'outline', label: 'Outline Builder', desc: 'Generate complete structured outlines' },
                    { id: 'titles', label: 'SEO Title Optimizer', desc: 'Generate clicking high-CTR headlines' },
                    { id: 'seo', label: 'SEO Schema Optimizer', desc: 'Analyze readability score, target terms' },
                    { id: 'tone', label: 'Tone and Grammar Analysis', desc: 'Refine professional editorial voice' },
                    { id: 'newsletter', label: 'Social & Newsletter Generator', desc: 'Export email text or Twitter loops' }
                  ].map(task => (
                    <button
                      key={task.id}
                      onClick={() => { setAiTask(task.id as any); setAiOutput(''); }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        aiTask === task.id
                          ? 'bg-indigo-600/10 border-indigo-500 text-white'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs block leading-tight">{task.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block leading-normal">{task.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Live execution interface */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6 flex flex-col justify-between min-h-[460px]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="capitalize">Workflow: {aiTask}</span>
                      </h3>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        MODEL: GEMINI-3.5-FLASH
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Input Context or Topic:</label>
                      <textarea
                        rows={4}
                        placeholder={
                          aiTask === 'topic' ? 'Describe the topic niche (e.g. "Artificial intelligence Micro-SaaS growth in 2026")' :
                          aiTask === 'titles' ? 'Describe the core topic (e.g. "The ultimate playbook on booting a software company alone")' :
                          'Enter your raw article content or paragraphs here to analyze...'
                        }
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                      />
                    </div>

                    {aiOutput && (
                      <div className="space-y-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Gemini Output Suggestions:</span>
                        <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                          {aiOutput}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-4">
                    <span className="text-[10px] text-slate-500 font-mono">Operations run server-side</span>
                    <button
                      onClick={handleAiCall}
                      disabled={aiLoading || !aiInput}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-full flex items-center space-x-2 shadow-lg"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Context...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Execute Workflow</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 6: KNOWLEDGE BASE Hub CRUD
              ========================================== */}
          {activeTab === 'knowledge' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Knowledge Hub & Materials Governance</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage static collections, download files, listed AI Tools directory, and guides.
                </p>
              </div>

              {/* Subtabs for listed entities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* AI Tools Administration Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-sm text-white flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>AI Tools Directory</span>
                      </span>
                      <button 
                        onClick={() => setCurrentEntityEditing({ type: 'tool', data: {} })}
                        className="p-1 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500"
                        title="Add Tool"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {aiTools.map(t => (
                        <div key={t.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{t.name}</span>
                            <span className="text-[10px] text-indigo-400">{t.category}</span>
                          </div>
                          <div className="space-x-1 flex">
                            <button onClick={() => setCurrentEntityEditing({ type: 'tool', data: t })} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleEntityDelete('tool', t.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resource Materials Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-sm text-white flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4 text-emerald-500" />
                        <span>Resource Materials</span>
                      </span>
                      <button 
                        onClick={() => setCurrentEntityEditing({ type: 'resource', data: {} })}
                        className="p-1 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500"
                        title="Add Resource"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {resources.map(r => (
                        <div key={r.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{r.title}</span>
                            <span className="text-[10px] text-emerald-400">{r.type} • {r.fileSize}</span>
                          </div>
                          <div className="space-x-1 flex">
                            <button onClick={() => setCurrentEntityEditing({ type: 'resource', data: r })} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleEntityDelete('resource', r.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tutorials and Guides Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-bold text-sm text-white flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span>Guides & Knowledge Articles</span>
                      </span>
                      <button 
                        onClick={() => setCurrentEntityEditing({ type: 'guide', data: {} })}
                        className="p-1 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500"
                        title="Add Guide"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {guides.map(g => (
                        <div key={g.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{g.title}</span>
                            <span className="text-[10px] text-indigo-400">{g.difficulty} • {g.durationMinutes} min</span>
                          </div>
                          <div className="space-x-1 flex">
                            <button onClick={() => setCurrentEntityEditing({ type: 'guide', data: g })} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleEntityDelete('guide', g.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Entity Form Drawer */}
              {currentEntityEditing && (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-sans font-bold text-sm text-white capitalize">
                      {currentEntityEditing.data.id ? 'Edit' : 'Create New'} {currentEntityEditing.type} Form
                    </h3>
                    <button onClick={() => setCurrentEntityEditing(null)} className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleEntitySave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {currentEntityEditing.type === 'tool' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Tool Name</label>
                          <input type="text" required value={currentEntityEditing.data.name || ''} onChange={(e) => setCurrentEntityEditing({type: 'tool', data: {...currentEntityEditing.data, name: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Category</label>
                          <input type="text" required value={currentEntityEditing.data.category || ''} onChange={(e) => setCurrentEntityEditing({type: 'tool', data: {...currentEntityEditing.data, category: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-400 block font-semibold">Description</label>
                          <textarea rows={2} required value={currentEntityEditing.data.description || ''} onChange={(e) => setCurrentEntityEditing({type: 'tool', data: {...currentEntityEditing.data, description: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Pricing Structure</label>
                          <select value={currentEntityEditing.data.pricingType || 'Free'} onChange={(e) => setCurrentEntityEditing({type: 'tool', data: {...currentEntityEditing.data, pricingType: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white">
                            <option value="Free">Free</option>
                            <option value="Freemium">Freemium</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Affiliate/Link URL</label>
                          <input type="text" value={currentEntityEditing.data.url || ''} onChange={(e) => setCurrentEntityEditing({type: 'tool', data: {...currentEntityEditing.data, url: e.target.value, affiliateUrl: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                      </>
                    )}

                    {currentEntityEditing.type === 'resource' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Resource Title</label>
                          <input type="text" required value={currentEntityEditing.data.title || ''} onChange={(e) => setCurrentEntityEditing({type: 'resource', data: {...currentEntityEditing.data, title: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Material Type</label>
                          <select value={currentEntityEditing.data.type || 'PDF'} onChange={(e) => setCurrentEntityEditing({type: 'resource', data: {...currentEntityEditing.data, type: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white">
                            <option value="PDF">PDF eBook</option>
                            <option value="Template">Notion Template</option>
                            <option value="Checklist">Printable Checklist</option>
                            <option value="Prompt Pack">Prompt Engineering Pack</option>
                          </select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-400 block font-semibold">Summary/Objective</label>
                          <textarea rows={2} required value={currentEntityEditing.data.description || ''} onChange={(e) => setCurrentEntityEditing({type: 'resource', data: {...currentEntityEditing.data, description: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                      </>
                    )}

                    {currentEntityEditing.type === 'guide' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Guide Title</label>
                          <input type="text" required value={currentEntityEditing.data.title || ''} onChange={(e) => setCurrentEntityEditing({type: 'guide', data: {...currentEntityEditing.data, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 block font-semibold">Difficulty Level</label>
                          <select value={currentEntityEditing.data.difficulty || 'Beginner'} onChange={(e) => setCurrentEntityEditing({type: 'guide', data: {...currentEntityEditing.data, difficulty: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white">
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-400 block font-semibold">Markdown Content Body</label>
                          <textarea rows={4} required value={currentEntityEditing.data.content || ''} onChange={(e) => setCurrentEntityEditing({type: 'guide', data: {...currentEntityEditing.data, content: e.target.value}})} className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-white font-mono" />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2 flex justify-end space-x-2 pt-2 border-t border-slate-850">
                      <button type="button" onClick={() => setCurrentEntityEditing(null)} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl font-bold">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md">Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              SUBVIEW 7: MEDIA LIBRARY
              ========================================== */}
          {activeTab === 'media' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Media and Asset Library</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Compress, organize tags, preview, and audit platform media elements.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* File Upload & Compression Logs */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md text-xs">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">ASSET UPLOAD & ENGINE</span>
                  
                  <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      onChange={handleMediaUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <Image className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <span className="font-bold text-slate-200 block">Drag & Drop file here</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Accepts images, videos, PDFs up to 50MB</span>
                  </div>

                  {compressionLogs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">COMPRESSION LOGS:</span>
                      <div className="bg-slate-900/60 p-2.5 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[10px] text-emerald-300">
                        {compressionLogs.map((log, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Media grid list */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">ACTIVE IMAGES & RESOURCES</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {mediaList.map(media => (
                      <div key={media.id} className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden p-3 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
                        <div className="w-full h-24 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-850 overflow-hidden">
                          {media.type.startsWith('image/') ? (
                            <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=300" alt={media.alt} className="w-full h-full object-cover" />
                          ) : (
                            <FolderOpen className="w-8 h-8 text-emerald-400" />
                          )}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block truncate">{media.name}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{media.size} • {media.type}</span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {media.tags.map((t: string) => (
                              <span key={t} className="px-1.5 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 text-[8px] font-bold rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end pt-1 border-t border-slate-850">
                          <button 
                            onClick={() => {
                              const alt = prompt('Enter SEO Alt Text description:', media.alt);
                              if (alt !== null) {
                                setMediaList(prev => prev.map(m => m.id === media.id ? {...m, alt} : m));
                              }
                            }} 
                            className="text-[10px] font-bold text-indigo-400 hover:underline"
                          >
                            Edit Alt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 8: NEWSLETTER CAMPAIGNS
              ========================================== */}
          {activeTab === 'newsletter' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Newsletter Campaigns Builder</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Write templates, dispatch weekly digests, and review active email readership trends.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Builder Panel */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">CAMPAIGN DESIGNER</span>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Email Subject Header</label>
                      <input 
                        type="text" 
                        value={newsSubject} 
                        onChange={(e) => setNewsSubject(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Body (Markdown or Rich Text)</label>
                      <textarea 
                        rows={8} 
                        value={newsContent} 
                        onChange={(e) => setNewsContent(e.target.value)} 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <button 
                      onClick={handleSendCampaign}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg"
                    >
                      <Send className="w-4 h-4" />
                      <span>Dispatch Campaign</span>
                    </button>
                  </div>
                </div>

                {/* Subscriptions Stats */}
                <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                  <h3 className="font-sans font-bold text-sm text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Audience Metrics</span>
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-900/60 p-4 border border-slate-850 rounded-2xl">
                      <span className="text-slate-400 block">Total Active Subscribers</span>
                      <span className="text-3xl font-black text-white block mt-1">{metrics?.subscribersCount || 180}</span>
                      <span className="text-[10px] text-emerald-400 block mt-1">✦ +14 growth vectors in July</span>
                    </div>

                    <div className="space-y-2">
                      <span className="font-mono text-[9px] font-bold text-slate-500 uppercase block">Active subscriber lists:</span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {usersList.slice(0, 4).map((u, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-900/40 p-2 border border-slate-850 rounded-xl">
                            <span className="text-slate-300 font-medium">{u.email}</span>
                            <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-bold font-mono uppercase">ACTIVE</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 9: COMMUNITY & COMMENTS MODERATION
              ========================================== */}
          {activeTab === 'community' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Community & Moderation Hub</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Review reported items, moderate reader comment logs, and engage with followers.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">PENDING COMMENTS MODERATION QUEUE</span>
                
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="font-bold text-sm">Comments Queue is Empty!</p>
                      <p className="text-xs mt-1">Every active comment is approved and in compliance.</p>
                    </div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200">{c.author}</span>
                            <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleString()}</span>
                            {c.content.toLowerCase().includes('http') && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider flex items-center space-x-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Trigger: External Link</span>
                            </span>}
                          </div>
                          <p className="text-slate-300 leading-normal">{c.content}</p>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                          <button onClick={() => alert('Reply simulated successfully.')} className="px-3 py-1 bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/25 border border-indigo-900/30 rounded-xl font-bold">
                            Reply
                          </button>
                          <button onClick={() => handleModerateComment(c.id)} className="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl font-bold">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 10: USER GOVERNANCE
              ========================================== */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Platform User Governance</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage reader profiles, assign simulated roles, and edit account permissions.
                </p>
              </div>

              {/* Users Grid */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">SIMULATED USERS INDEX</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usersList.map((usr, i) => (
                    <div key={usr.email || i} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-200 text-sm block leading-none mb-1">{usr.displayName || usr.email.split('@')[0]}</span>
                          <span className="text-[10px] font-mono text-slate-500">{usr.email}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider ${
                          usr.role === 'admin' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' :
                          usr.role === 'editor' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' :
                          usr.role === 'author' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {usr.role || 'registered'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-850">
                        <span>Streak: {usr.streakCount || 0} days</span>
                        <span>Goals: {usr.readingGoalMinutesPerDay || 10}m/day</span>
                        
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              const newRole = prompt('Set role (anonymous, registered, author, editor, admin):', usr.role || 'registered');
                              if (newRole) {
                                handleSaveUser({ ...usr, role: newRole });
                              }
                            }} 
                            className="text-indigo-400 hover:underline"
                          >
                            Set Role
                          </button>
                          <button onClick={() => handleDeleteUser(usr.email)} className="text-rose-400 hover:underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 11: ADVANCED ANALYTICS
              ========================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Advanced Editorial Analytics</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Audit granular readers interest, scroll depths, and conversion metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-slate-400 block text-xs">Average Scroll Depth</span>
                  <span className="text-3xl font-black text-white block">76.8%</span>
                  <p className="text-[10px] text-slate-500 mt-1">Granular cohort reading completion tracking</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-slate-400 block text-xs">Read Completion Rate</span>
                  <span className="text-3xl font-black text-white block">68.2%</span>
                  <p className="text-[10px] text-slate-500 mt-1">Average conversion of visits into reading completion</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <span className="text-slate-400 block text-xs">Average Reading Time</span>
                  <span className="text-3xl font-black text-white block">4.2 min</span>
                  <p className="text-[10px] text-slate-500 mt-1">Daily engagement timeline per reading session</p>
                </div>
              </div>

              {/* Top Search Queries Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">TOP READERS SEARCH INQUIRIES</span>
                <div className="space-y-2">
                  {[
                    { query: 'Gemini 3.5 architecture features', count: 42, trends: '+150%' },
                    { query: 'Micro-SaaS bootstrapping checklist', count: 35, trends: '+80%' },
                    { query: 'Solopreneur marketing tactics', count: 18, trends: '+12%' }
                  ].map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex justify-between items-center">
                      <span className="font-bold text-slate-200">{q.query}</span>
                      <div className="flex space-x-4 font-mono text-[11px]">
                        <span className="text-indigo-400 font-bold">{q.count} times</span>
                        <span className="text-emerald-400 font-bold">{q.trends}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 12: MONETIZATION HUB
              ========================================== */}
          {activeTab === 'monetization' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Monetization & Affiliate Yield</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Track members memberships, affiliate directory click-throughs, and sponsored article revenue channels.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Sponsorship details */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-md text-xs">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">PREMIUM MEMBERSHIPS</span>
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
                    <span className="text-slate-400">Total Membership Revenue</span>
                    <span className="text-2xl font-black text-white block mt-1">{metrics?.revenueMetrics?.breakdown?.memberships || '$1,440.00'}</span>
                  </div>
                  <p className="text-slate-500 leading-normal">Yield from newsletter subscription preferences and paid directories access loops.</p>
                </div>

                {/* Affiliates */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-md text-xs">
                  <span className="font-mono text-[9px] font-bold text-amber-400 uppercase tracking-widest block border-b border-slate-800 pb-2">AFFILIATE INTEGRATION YIELD</span>
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
                    <span className="text-slate-400">Affiliate Commission Total</span>
                    <span className="text-2xl font-black text-white block mt-1">{metrics?.revenueMetrics?.breakdown?.affiliates || '$320.00'}</span>
                  </div>
                  <p className="text-slate-500 leading-normal">Yield calculated dynamically from printable checklist and prompts download hooks.</p>
                </div>

                {/* Sponsorship postings */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-md text-xs">
                  <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest block border-b border-slate-800 pb-2">SPONSORED CAMPAIGNS</span>
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
                    <span className="text-slate-400">Sponsored Ad Campaigns</span>
                    <span className="text-2xl font-black text-white block mt-1">{metrics?.revenueMetrics?.breakdown?.sponsorships || '$60.00'}</span>
                  </div>
                  <p className="text-slate-500 leading-normal">Revenue generated by contextual inline promotion slots and featured listings.</p>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 13: SECURITY AUDIT LOGS
              ========================================== */}
          {activeTab === 'audit' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Platform Security Audit Log</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Review complete platform events including login operations, role escalation attempts, settings updates, and AI queries.
                </p>
              </div>

              {/* Audit Controls */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-md text-xs">
                <div className="flex gap-2">
                  {['all', 'Login', 'Update', 'Workflow', 'AI'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAuditFilter(tab)}
                      className={`px-3 py-1 rounded-xl font-bold border transition-colors ${
                        auditFilter === tab
                          ? 'bg-indigo-600/10 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'all' ? 'All Operations' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Log Table */}
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-widest text-[9px] font-black">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Responsible User</th>
                      <th className="p-4">Action Event</th>
                      <th className="p-4">Entity Type</th>
                      <th className="p-4">Granular Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-900/40 font-mono text-[11px] text-slate-300">
                        <td className="p-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4 font-bold text-slate-200">{log.user}</td>
                        <td className="p-4 font-bold text-indigo-400">{log.action}</td>
                        <td className="p-4 text-amber-500 font-bold">{log.entity}</td>
                        <td className="p-4 text-slate-400">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 14: CENTRAL SETTINGS
              ========================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black text-white">Central Operations Configuration</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Configure environment features, maintenance gates, Gemini API secrets, and platform branding.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-xs max-w-4xl">
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block border-b border-slate-800 pb-2">SYSTEM PARAMETERS</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Nexus Brand Name</label>
                    <input 
                      type="text" 
                      value={siteSettings.brandName} 
                      onChange={(e) => setSiteSettings({...siteSettings, brandName: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Gemini Engine Model</label>
                    <select 
                      value={siteSettings.geminiModel} 
                      onChange={(e) => setSiteSettings({...siteSettings, geminiModel: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                    >
                      <option value="gemini-3.5-flash">gemini-3.5-flash (Standard text Summaries)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Outlines)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Default SEO Metadata Title</label>
                    <input 
                      type="text" 
                      value={siteSettings.seoDefaultTitle} 
                      onChange={(e) => setSiteSettings({...siteSettings, seoDefaultTitle: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold block">Simulated Server API Key</label>
                    <input 
                      type="password" 
                      value={siteSettings.apiKey} 
                      onChange={(e) => setSiteSettings({...siteSettings, apiKey: e.target.value})} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                    />
                  </div>

                  {/* Toggle switches */}
                  <div className="space-y-4 md:col-span-2 pt-2 border-t border-slate-850">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200 block">System Maintenance Mode Gate</span>
                        <span className="text-[11px] text-slate-500">Route visitors to static maintenance cards if checked.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={siteSettings.maintenanceMode} 
                        onChange={(e) => {
                          setSiteSettings({...siteSettings, maintenanceMode: e.target.checked});
                          logAuditAction('Toggle Gate', 'Settings', `Set Maintenance Mode to: ${e.target.checked}`);
                        }} 
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200 block">Deploy Automated Recommendation Engine</span>
                        <span className="text-[11px] text-slate-500">Integrate vector search embeddings to suggest internal links.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={siteSettings.enableAIRecommendation} 
                        onChange={(e) => {
                          setSiteSettings({...siteSettings, enableAIRecommendation: e.target.checked});
                          logAuditAction('Toggle Feature', 'Settings', `Set Recommendation Engine to: ${e.target.checked}`);
                        }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-850">
                  <button 
                    onClick={() => {
                      logAuditAction('Update Settings', 'Settings', 'Saved system configurations parameters');
                      triggerAlert('Settings Saved', 'Nexus brand system configurations parameters written successfully.');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg"
                  >
                    Save Config Rules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUBVIEW 15: SUPABASE INTEGRATION VIEW
              ========================================== */}
          {activeTab === 'supabase' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                  <Database className="w-6 h-6 text-indigo-500 animate-pulse" />
                  <span>Supabase Database Hub</span>
                  <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-full font-mono uppercase tracking-widest">
                    {supabaseStatus?.connected ? "LIVE CONNECTION" : "FALLBACK ACTIVE"}
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Configure live production synchronization, inspect schema table health, and execute data migrations.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Connection Status & Table Health */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="font-sans font-bold text-sm text-white border-b border-slate-800 pb-2">
                      Database Connection Status
                    </h3>
                    
                    {supabaseStatus?.connected ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-emerald-950/20 border border-emerald-500/25 rounded-2xl">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                          <div>
                            <span className="text-xs font-bold text-emerald-400 block">Supabase Connection Active</span>
                            <span className="text-[10px] text-slate-400">All data operations are routing to your live database instance in real-time.</span>
                          </div>
                        </div>

                        <div className="text-xs space-y-2 font-mono text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-slate-500 block text-[10px] font-bold">SUPABASE URL</span>
                            <span className="text-indigo-400 truncate block">Connected to active live instance</span>
                          </div>
                          <div className="pt-2">
                            <span className="text-slate-500 block text-[10px] font-bold">CLIENT ENGINE STATE</span>
                            <span className="text-emerald-400">Ready (Operational)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-amber-400 block">Fallback Database Enabled (Local Only)</span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                              The application is securely storing and serving content from a local JSON seed file (<code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-amber-300">db.json</code>).
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs space-y-3 leading-normal">
                          <span className="font-bold text-white block">How to Connect Supabase:</span>
                          <ol className="list-decimal pl-4 space-y-2 text-slate-400 text-[11px]">
                            <li>Open the <strong>Settings</strong> panel from the top right or the sidebar.</li>
                            <li>Go to <strong>Secrets / Environment Variables</strong>.</li>
                            <li>Declare these two variables:
                              <div className="mt-1 font-mono text-[10px] bg-slate-950 p-2 rounded-lg space-y-1 text-slate-300">
                                <div>SUPABASE_URL=https://your-project.supabase.co</div>
                                <div>SUPABASE_ANON_KEY=your-anon-api-key</div>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={testSupabaseConnection}
                        disabled={supabaseLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all"
                      >
                        {supabaseLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Connection...</span>
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4" />
                            <span>Test Live Connection</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Schema Health Monitor */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="font-sans font-bold text-sm text-white">
                        Database Schema Matrix
                      </h3>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Table Verification
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 font-sans">
                      {[
                        { name: 'articles', desc: 'Articles & revision logs' },
                        { name: 'comments', desc: 'Visitor article comments' },
                        { name: 'subscribers', desc: 'Newsletter subscribers' },
                        { name: 'resources', desc: 'E-book & template resources' },
                        { name: 'ai_tools', desc: 'AI directory listings' },
                        { name: 'topic_clusters', desc: 'SEO clusters & pillars' },
                        { name: 'reading_sessions', desc: 'Reader metrics logs' },
                        { name: 'reader_profiles', desc: 'Reader bookmarks & goals' },
                        { name: 'knowledge_guides', desc: 'Learning guides & tutorials' }
                      ].map((table) => {
                        const verified = supabaseStatus?.tables?.[table.name] === true;
                        return (
                          <div key={table.name} className="flex items-center justify-between p-2 rounded-xl border border-slate-900 bg-slate-900/30">
                            <div>
                              <span className="font-mono text-xs text-slate-200 block font-bold">{table.name}</span>
                              <span className="text-[10px] text-slate-500">{table.desc}</span>
                            </div>
                            <div>
                              {supabaseStatus?.connected ? (
                                verified ? (
                                  <span className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>FOUND</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-500/20">
                                    <X className="w-3.5 h-3.5 text-rose-400" />
                                    <span>MISSING</span>
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                                  Local Fallback
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: SQL script Copy & Data Migrator */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Step 1: SQL Editor */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">MIGRATION GUIDE</span>
                        <h3 className="font-sans font-bold text-sm text-white">
                          1. Create Database Tables
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sqlSchema);
                          setCopiedSchema(true);
                          setTimeout(() => setCopiedSchema(false), 2000);
                        }}
                        className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/30 px-3 py-1.5 rounded-xl border border-indigo-500/20"
                      >
                        {copiedSchema ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-sans">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="font-sans">Copy SQL Script</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      Copy the generated script below, open your <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline inline-flex items-center font-sans">Supabase SQL Editor <ArrowUpRight className="w-3 h-3 ml-0.5" /></a>, paste it into a new query window, and click <strong>Run</strong>.
                    </p>

                    <div className="relative font-mono text-[10px] bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 max-h-[300px] overflow-y-auto text-slate-300">
                      <pre className="whitespace-pre-wrap leading-normal">{sqlSchema}</pre>
                    </div>
                  </div>

                  {/* Step 2: Data Seeding and Synchronization */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div>
                      <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">DATA SEEDING</span>
                      <h3 className="font-sans font-bold text-sm text-white">
                        2. Synchronize Seed & Local Data to Supabase
                      </h3>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal font-sans">
                      Once your tables are created, click the button below to populate them with the default content seed. This migrates all existing articles, categories, comments, subscribers, AI tools, resources, and reader profiles into your Supabase database.
                    </p>

                    {syncStatus && (
                      <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 text-xs font-mono text-indigo-300 leading-normal whitespace-pre-wrap">
                        {syncStatus}
                      </div>
                    )}

                    <div className="pt-2 font-sans">
                      <button
                        onClick={runSupabaseSync}
                        disabled={syncLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-xl transition-all"
                      >
                        {syncLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Synchronizing Database Schemas...</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-4 h-4" />
                            <span>Sync Data to Supabase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assistant' && (
            <PublishingAssistantDashboard onRefreshArticles={onRefreshArticles} />
          )}

          {activeTab === 'notifications' && (
            <AdminNotificationPanel />
          )}

          {activeTab === 'settings' && (
            <SettingsDashboard />
          )}

        </main>

      </div>

      {/* ==========================================
          MASTER DYNAMIC ARTICLE FORM MODAL
          ========================================== */}
      {isEditModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white">
                {editingArticle.id ? 'Modify Publication Template' : 'Initiate New Publication'}
              </h2>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingArticle(null); }}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 block font-semibold">Headline/Title</label>
                <input 
                  type="text" 
                  required 
                  value={editingArticle.title || ''} 
                  onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Niche Category</label>
                <select 
                  value={editingArticle.category || 'Artificial Intelligence'} 
                  onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Workflow State</label>
                <select 
                  value={editingArticle.workflowState || 'Idea'} 
                  onChange={(e) => setEditingArticle({...editingArticle, workflowState: e.target.value as any})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Idea">Idea Bank</option>
                  <option value="Outline">In Research / Outline</option>
                  <option value="Draft">Drafting Phase</option>
                  <option value="Editor Review">Editor & SEO Review</option>
                  <option value="Published">Approved & Published</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Scheduled Date (YYYY-MM-DD)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2026-07-08" 
                  value={editingArticle.dueDate || ''} 
                  onChange={(e) => setEditingArticle({...editingArticle, dueDate: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Featured Image URL</label>
                <input 
                  type="text" 
                  value={editingArticle.featuredImage || ''} 
                  onChange={(e) => setEditingArticle({...editingArticle, featuredImage: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 block font-semibold">Content Summary (SEO meta)</label>
                <textarea 
                  rows={2} 
                  value={editingArticle.summary || ''} 
                  onChange={(e) => setEditingArticle({...editingArticle, summary: e.target.value, seoDescription: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" 
                />
              </div>

              <div className="space-y-1 md:col-span-2 font-mono">
                <label className="text-slate-400 block font-semibold font-sans">Full Markdown Content Body</label>
                <textarea 
                  rows={8} 
                  required 
                  value={editingArticle.content || ''} 
                  onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none" 
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => { setIsEditModalOpen(false); setEditingArticle(null); }} 
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl font-bold transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors"
                >
                  Write to DB
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal Overlay */}
      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-sans font-black text-lg text-white tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span>{confirmState.title}</span>
            </h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-sans text-xs font-bold border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmState.onConfirm}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-sans text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal Overlay */}
      {alertState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-sans font-black text-lg text-white tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full"></span>
              <span>{alertState.title}</span>
            </h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              {alertState.message}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAlertState(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
