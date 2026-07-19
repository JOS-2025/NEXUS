import React from 'react';
import { 
  Newspaper, Save, Sparkles, BookOpen, Clock, AlertTriangle, FileText, 
  LayoutList, History, Check, ShieldAlert, BadgeHelp, Clipboard, 
  ChevronRight, ListCollapse, Eye, User, Calendar as CalendarIcon, 
  Trash2, Edit3, ArrowRight, CheckSquare, ListTodo, Activity, 
  RefreshCw, Send, HelpCircle, FileDiff 
} from 'lucide-react';
import { Article, TaskChecklistItem, ActivityHistoryItem, Revision } from '../types';
import AuthorDashboard from './AuthorDashboard';

interface CmsStudioProps {
  userRole: 'anonymous' | 'registered' | 'author' | 'editor' | 'admin';
  articles: Article[];
  onRefreshArticles: () => Promise<void>;
}

export default function CmsStudio({ userRole, articles, onRefreshArticles }: CmsStudioProps) {
  // Gated access check
  const hasAccess = ['author', 'editor', 'admin'].includes(userRole);

  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(null);
  
  // Editorial inputs state
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('Artificial Intelligence');
  const [tags, setTags] = React.useState('AI, Machine Learning');
  const [content, setContent] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'published'>('draft');
  const [seoTitle, setSeoTitle] = React.useState('');
  const [seoDescription, setSeoDescription] = React.useState('');

  // MODULE 1 - Editorial Workflow States
  const [workflowState, setWorkflowState] = React.useState<Article['workflowState']>('Idea');
  const [assignedAuthor, setAssignedAuthor] = React.useState('Sarah Chen');
  const [assignedEditor, setAssignedEditor] = React.useState('Site Editor');
  const [dueDate, setDueDate] = React.useState('');
  const [editorialNotes, setEditorialNotes] = React.useState('');
  const [taskChecklist, setTaskChecklist] = React.useState<TaskChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = React.useState('');
  const [activityHistory, setActivityHistory] = React.useState<ActivityHistoryItem[]>([]);

  // MODULE 2 - Article Version Control
  const [revisions, setRevisions] = React.useState<Revision[]>([]);
  const [compareRevision, setCompareRevision] = React.useState<Revision | null>(null);

  // MODULE 8 - Calendar View mode
  const [activeStudioTab, setActiveStudioTab] = React.useState<'studio' | 'calendar' | 'dashboard'>(
    userRole === 'author' ? 'dashboard' : 'studio'
  );

  // MODULE 11 - AI features states
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiSuggestions, setAiSuggestions] = React.useState<string[]>([]);
  const [aiOutline, setAiOutline] = React.useState<string | null>(null);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [aiReadability, setAiReadability] = React.useState<{ gradeLevel?: string; score?: number; readingTime?: string; suggestions?: string[] } | null>(null);
  const [aiPrompts, setAiPrompts] = React.useState<{ id: string; title: string; description: string; template: string }[]>([]);
  const [aiInternalLinks, setAiInternalLinks] = React.useState<{ targetArticleId: string; anchorText: string; contextHint: string }[]>([]);
  const [aiToneAnalysis, setAiToneAnalysis] = React.useState<{ toneType?: string; readingEaseScore?: number; sentiment?: string; editorialCritique?: string } | null>(null);
  const [aiSocialCaptions, setAiSocialCaptions] = React.useState<{ linkedin?: string; x?: string; newsletter?: string } | null>(null);
  const [aiFaqs, setAiFaqs] = React.useState<{ question: string; answer: string }[]>([]);
  
  const [activeAiTab, setActiveAiTab] = React.useState<'titles' | 'outlines' | 'readability' | 'internal-links' | 'tone-check' | 'faqs' | 'social-captions' | 'prompts'>('titles');
  const [aiKeywordsInput, setAiKeywordsInput] = React.useState('');
  const [aiTopicInput, setAiTopicInput] = React.useState('');
  
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [lastAutoSavedTime, setLastAutoSavedTime] = React.useState<string | null>(null);
  const [lastSyncedTitle, setLastSyncedTitle] = React.useState('');
  const [lastSyncedContent, setLastSyncedContent] = React.useState('');

  // List of authors & editors
  const authors = ['Sarah Chen', 'Marcus Vance', 'Elena Rostova', 'Global Admin', 'Site Editor'];
  const editors = ['Site Editor', 'Chief Content Editor', 'Global Admin'];

  // Load preset prompt library on mount
  React.useEffect(() => {
    fetch('/api/ai/prompts')
      .then(res => res.json())
      .then(data => setAiPrompts(data))
      .catch(err => console.error("Could not load prompt templates", err));
  }, []);

  // Sync revisions from backend when active article changes
  const fetchRevisions = async (articleId: string) => {
    try {
      const res = await fetch(`/api/articles/${articleId}/revisions`);
      if (res.ok) {
        const data = await res.json();
        setRevisions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // When selected article changes, load values
  const handleSelectArticle = (art: Article | null) => {
    if (art) {
      setSelectedArticleId(art.id);
      setTitle(art.title);
      setCategory(art.category);
      setTags(art.tags.join(', '));
      setContent(art.content);
      setSummary(art.summary);
      setStatus(art.status);
      setSeoTitle(art.seoTitle || art.title);
      setSeoDescription(art.seoDescription || art.summary);
      
      setLastSyncedTitle(art.title);
      setLastSyncedContent(art.content);
      setAutoSaveStatus('idle');
      setLastAutoSavedTime(null);
      
      // Workflow values
      setWorkflowState(art.workflowState || 'Idea');
      setAssignedAuthor(art.assignedAuthor || 'Sarah Chen');
      setAssignedEditor(art.assignedEditor || 'Site Editor');
      setDueDate(art.dueDate || '');
      setEditorialNotes(art.editorialNotes || '');
      setTaskChecklist(art.taskChecklist || []);
      setActivityHistory(art.activityHistory || []);

      fetchRevisions(art.id);
    } else {
      // Clear for new article
      setSelectedArticleId(null);
      setTitle('');
      setCategory('Artificial Intelligence');
      setTags('AI, Technology');
      setContent('');
      setSummary('');
      setStatus('draft');
      setSeoTitle('');
      setSeoDescription('');

      setLastSyncedTitle('');
      setLastSyncedContent('');
      setAutoSaveStatus('idle');
      setLastAutoSavedTime(null);

      // Workflow defaults
      setWorkflowState('Idea');
      setAssignedAuthor('Sarah Chen');
      setAssignedEditor('Site Editor');
      setDueDate('');
      setEditorialNotes('');
      setTaskChecklist([
        { id: '1', text: 'Create initial article draft content', done: false },
        { id: '2', text: 'Analyze and optimize with AI Writing Assistant', done: false },
        { id: '3', text: 'Apply internal contextual link suggestions', done: false },
        { id: '4', text: 'SEO and Social Captions generation', done: false },
        { id: '5', text: 'Approved for publication stream', done: false }
      ]);
      setActivityHistory([
        { timestamp: new Date().toISOString(), action: 'Initiated new idea document', user: 'Creator' }
      ]);
      setRevisions([]);
    }
    // Reset AI states
    setAiSuggestions([]);
    setAiOutline(null);
    setAiSummary(null);
    setAiReadability(null);
    setAiInternalLinks([]);
    setAiToneAnalysis(null);
    setAiSocialCaptions(null);
    setAiFaqs([]);
    setCompareRevision(null);
  };

  // Submit Article Update/Create
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSaveLoading(true);
    setSaveSuccess(false);
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        id: selectedArticleId,
        title,
        content,
        summary,
        category,
        tags: parsedTags,
        status,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || summary,
        authorName: userRole === 'admin' ? 'Global Admin' : userRole === 'editor' ? 'Lead Editor' : 'Staff Writer',
        authorRole: userRole.toUpperCase()
      };

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Could not save article.");
      const saved = await res.json();
      
      // Update DPOS Workflow details
      const workflowPayload = {
        workflowState,
        assignedAuthor,
        assignedEditor,
        dueDate,
        editorialNotes,
        taskChecklist,
        activityItem: {
          action: selectedArticleId ? "Saved draft and updated variables" : "Successfully created and initialized article",
          user: userRole === 'admin' ? 'Global Admin' : 'Staff Writer'
        }
      };

      const workflowRes = await fetch(`/api/articles/${saved.id}/workflow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowPayload),
      });

      if (workflowRes.ok) {
        const fullyUpdated = await workflowRes.json();
        setActivityHistory(fullyUpdated.activityHistory || []);
      }
      
      setSaveSuccess(true);
      setLastSyncedTitle(title);
      setLastSyncedContent(content);
      setAutoSaveStatus('saved');
      setLastAutoSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      await onRefreshArticles();
      setSelectedArticleId(saved.id);
      fetchRevisions(saved.id);
      
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || "Error occurred");
    } finally {
      setSaveLoading(false);
    }
  };

  // Trigger automatic saving of drafts
  const triggerAutoSave = React.useCallback(async (currTitle: string, currContent: string) => {
    if (!currTitle.trim() || !currContent.trim()) return;
    if (currTitle === lastSyncedTitle && currContent === lastSyncedContent) return;

    setAutoSaveStatus('saving');
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        id: selectedArticleId,
        title: currTitle,
        content: currContent,
        summary,
        category,
        tags: parsedTags,
        status,
        seoTitle: seoTitle || currTitle,
        seoDescription: seoDescription || summary,
        authorName: userRole === 'admin' ? 'Global Admin' : userRole === 'editor' ? 'Lead Editor' : 'Staff Writer',
        authorRole: userRole.toUpperCase(),
        isAutosave: true
      };

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Auto-save call rejected");
      const saved = await res.json();

      setLastSyncedTitle(currTitle);
      setLastSyncedContent(currContent);
      setAutoSaveStatus('saved');
      setLastAutoSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Keep ID updated if we successfully auto-saved a new document
      if (!selectedArticleId) {
        setSelectedArticleId(saved.id);
        await onRefreshArticles();
      }
    } catch (err) {
      console.error("Autosave draft failed:", err);
      setAutoSaveStatus('failed');
    }
  }, [
    selectedArticleId,
    tags,
    summary,
    category,
    status,
    seoTitle,
    userRole,
    onRefreshArticles,
    lastSyncedTitle,
    lastSyncedContent
  ]);

  // Handle typing debounce for auto-save
  React.useEffect(() => {
    // If empty content, we do not auto-save
    if (!title.trim() || !content.trim()) {
      return;
    }

    // If identical to last saved, we are already synced
    if (title === lastSyncedTitle && content === lastSyncedContent) {
      return;
    }

    // Indicate that there are unsaved changes
    setAutoSaveStatus('idle');

    // Debounce duration: 3.5 seconds
    const delayDebounceFn = setTimeout(() => {
      triggerAutoSave(title, content);
    }, 3500);

    return () => clearTimeout(delayDebounceFn);
  }, [title, content, triggerAutoSave, lastSyncedTitle, lastSyncedContent]);

  // PATCH workflow state directly on trigger
  const updateWorkflowStateOnBackend = async (newState: Article['workflowState']) => {
    if (!selectedArticleId) return;
    try {
      const res = await fetch(`/api/articles/${selectedArticleId}/workflow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowState: newState,
          activityItem: {
            action: `Transformed status to [${newState}]`,
            user: userRole === 'admin' ? 'Global Admin' : 'Creator'
          }
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflowState(updated.workflowState);
        setActivityHistory(updated.activityHistory || []);
        await onRefreshArticles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Restores a historic revision
  const handleRestoreRevision = async (rev: Revision) => {
    if (!selectedArticleId) return;
    if (window.confirm(`Revert to version from ${new Date(rev.timestamp).toLocaleString()}? Your current un-saved content will be replaced.`)) {
      try {
        const res = await fetch(`/api/articles/${selectedArticleId}/revisions/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: rev.timestamp }),
        });
        if (res.ok) {
          const restored = await res.json();
          setTitle(restored.title);
          setContent(restored.content);
          setWorkflowState(restored.workflowState || 'Idea');
          setActivityHistory(restored.activityHistory || []);
          setCompareRevision(null);
          await onRefreshArticles();
          alert("Revision successfully restored!");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Checklist updates
  const handleToggleChecklistItem = (itemId: string) => {
    const updated = taskChecklist.map(t => t.id === itemId ? { ...t, done: !t.done } : t);
    setTaskChecklist(updated);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: TaskChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistItem.trim(),
      done: false
    };
    setTaskChecklist([...taskChecklist, newItem]);
    setNewChecklistItem('');
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    setTaskChecklist(taskChecklist.filter(t => t.id !== itemId));
  };

  // AI Title Suggester
  const handleAiTitles = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/title-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: aiKeywordsInput || tags, description: title || summary }),
      });
      const data = await res.json();
      if (res.ok && data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Outline Creator
  const handleAiOutline = async () => {
    if (!aiTopicInput) {
      alert("Please provide a topic description");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/content-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopicInput }),
      });
      const data = await res.json();
      if (res.ok && data.outline) {
        setAiOutline(data.outline);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Content Summarizer
  const handleAiSummarize = async () => {
    if (!content) {
      alert("Please write some content first in the main editor!");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setAiSummary(data.summary);
        setSummary(data.summary); // autofill summary
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Readability Analyzer
  const handleAiReadability = async () => {
    if (!content) {
      alert("Write draft content in editor first!");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/reading-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiReadability(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Internal Contextual Links
  const handleAiInternalLinks = async () => {
    if (!content) {
      alert("Please write some prose in the editor first.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/internal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedArticleId, title, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiInternalLinks(data.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Tone Check
  const handleAiToneCheck = async () => {
    if (!content) {
      alert("Please write some prose in the editor first.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/tone-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiToneAnalysis(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI FAQs Generator
  const handleAiFaqs = async () => {
    if (!content) {
      alert("Prose content is required.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/faq-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiFaqs(data.faqs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Social Caption Generator
  const handleAiSocialCaptions = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/social-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSocialCaptions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // AI SEO Generator
  const handleAiSeo = async () => {
    if (!title || !content) {
      alert("Provide both Title and Content in editor first.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/seo-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeoTitle(data.seoTitle || '');
        setSeoDescription(data.seoDescription || '');
        setTags(data.keywords?.join(', ') || tags);
        alert("SEO Meta values generated and autofilled cleanly!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="inline-flex p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-full shadow-inner animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-sans font-extrabold text-xl text-gray-900">CMS Access Denied</h2>
          <p className="font-sans text-xs text-gray-500 leading-relaxed">
            The Creator Studio is strictly gated with Role-Based Access Controls (RBAC). Regular readers are prohibited from creating or modifying articles.
          </p>
          <div className="bg-slate-50 border border-gray-100 p-4 rounded-2xl mt-4">
            <span className="font-mono text-[10px] uppercase font-bold text-gray-400 block mb-1">How to inspect:</span>
            <p className="text-[11px] text-indigo-600 font-semibold leading-normal">
              Toggle your profile role to <strong>Author</strong>, <strong>Editor</strong>, or <strong>Administrator</strong> using the Selector at the top of the screen to unlock writing controls!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeArticleObj = articles.find(a => a.id === selectedArticleId);

  // Compute stats for active selected article (Module 13 Author Productivity)
  const views = activeArticleObj ? activeArticleObj.viewsCount : 0;
  const likes = activeArticleObj ? activeArticleObj.likesCount : 0;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="font-sans font-black text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-indigo-600" />
            <span>Digital Publishing Operating System (DPOS)</span>
          </h1>
          <p className="font-sans text-xs text-gray-500">
            Advanced multi-module newsroom management console for elite content orchestration.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex-wrap gap-1">
          {['author', 'editor', 'admin'].includes(userRole) && (
            <button
              onClick={() => setActiveStudioTab('dashboard')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeStudioTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Author Dashboard
            </button>
          )}
          <button
            onClick={() => setActiveStudioTab('studio')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStudioTab === 'studio' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Studio Workspace
          </button>
          <button
            onClick={() => setActiveStudioTab('calendar')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStudioTab === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Editorial Calendar
          </button>
        </div>
      </div>

      {activeStudioTab === 'dashboard' ? (
        <AuthorDashboard
          articles={articles}
          onRefreshArticles={onRefreshArticles}
          onEditArticle={(art) => {
            handleSelectArticle(art);
            setActiveStudioTab('studio');
          }}
          userRole={userRole}
        />
      ) : activeStudioTab === 'calendar' ? (
        /* MODULE 8: EDITORIAL CALENDAR GRID */
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-50 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <span>Launch Schedule Planner</span>
              </h2>
              <p className="text-xs text-gray-400">Map out release deadlines and coordinate author pipelines visually.</p>
            </div>
            <button
              onClick={() => handleSelectArticle(null)}
              className="text-xs bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl font-bold"
            >
              + Schedule Post
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {/* Days of week */}
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center font-mono text-[10px] font-bold text-gray-400 uppercase py-2 border-b border-gray-50 bg-gray-50/50 rounded-lg">
                {day}
              </div>
            ))}

            {/* Simulated 28 days of calendar with scheduled articles mapped onto dates */}
            {Array.from({ length: 28 }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-07-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const posts = articles.filter(a => a.dueDate === dateStr || (a.status === 'published' && a.publishedAt.startsWith(dateStr)));

              return (
                <div key={idx} className="min-h-24 bg-gray-50/20 border border-gray-100 rounded-xl p-2 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
                  <span className="font-mono text-[10px] font-bold text-gray-400 block">{dayNum}</span>
                  <div className="space-y-1 flex-1 mt-1 max-h-16 overflow-y-auto">
                    {posts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleSelectArticle(p);
                          setActiveStudioTab('studio');
                        }}
                        className={`p-1.5 rounded text-[10px] font-semibold leading-tight truncate cursor-pointer transition-all ${
                          p.workflowState === 'Published' 
                            ? 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500' 
                            : p.workflowState === 'Scheduled'
                            ? 'bg-indigo-50 text-indigo-800 border-l-2 border-indigo-500'
                            : 'bg-amber-50 text-amber-800 border-l-2 border-amber-500'
                        }`}
                      >
                        {p.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CORE WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Document Selector & Author Dashboard Metrics (Module 13) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Document Drawer List */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <h3 className="font-sans font-bold text-xs text-gray-900 flex items-center space-x-1.5">
                  <LayoutList className="w-4 h-4 text-indigo-500" />
                  <span>Publisher Catalog</span>
                </h3>
                <button
                  onClick={() => handleSelectArticle(null)}
                  className="text-[10px] bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-lg"
                >
                  + Create
                </button>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticle(art)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      selectedArticleId === art.id
                        ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900 shadow-sm'
                        : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1 py-0.5 rounded ${
                        art.workflowState === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {art.workflowState || 'Idea'}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">
                        {new Date(art.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold line-clamp-1 leading-tight">{art.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{art.category}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MODULE 13: AUTHOR PRODUCTIVITY METRICS */}
            {selectedArticleId && (
              <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-sans font-bold text-xs text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Author Metrics</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Telemetry of current publication</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-0.5">Reads count</span>
                    <span className="text-sm font-bold text-white block">{views}</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-0.5">Likes count</span>
                    <span className="text-sm font-bold text-white block">{likes}</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-0.5">Time to read</span>
                    <span className="text-sm font-bold text-white block">{readTimeMin} min</span>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-0.5">Prose words</span>
                    <span className="text-sm font-bold text-white block">{wordCount}</span>
                  </div>
                </div>

                {/* Progress bar on checklist completion */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Launch Checklist Progress</span>
                    <span className="text-indigo-400 font-bold">
                      {taskChecklist.length > 0 
                        ? Math.round((taskChecklist.filter(t => t.done).length / taskChecklist.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${taskChecklist.length > 0 ? (taskChecklist.filter(t => t.done).length / taskChecklist.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE COLUMN: Core WYSIWYG Editor & Workflow Variables (Module 1) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Core Document Variables and Editor form */}
            <form onSubmit={handleSaveArticle} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
              
              {/* Header variables Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-5 h-5 text-indigo-600" />
                  <span className="font-sans font-bold text-sm text-gray-900">
                    {selectedArticleId ? "Document Workspace" : "Compose Masterpiece"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Auto-save status badge */}
                  {title.trim() && content.trim() && (
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono font-bold transition-all duration-300">
                      {autoSaveStatus === 'saving' && (
                        <div className="flex items-center space-x-1.5 text-indigo-600 bg-indigo-50/70 px-2 py-1 rounded-lg">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                          <span>Saving...</span>
                        </div>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50/70 px-2 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Saved {lastAutoSavedTime ? `${lastAutoSavedTime}` : ''}</span>
                        </div>
                      )}
                      {autoSaveStatus === 'failed' && (
                        <div className="flex items-center space-x-1.5 text-red-600 bg-red-50/70 px-2 py-1 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          <span>Sync failed</span>
                        </div>
                      )}
                      {autoSaveStatus === 'idle' && (title !== lastSyncedTitle || content !== lastSyncedContent) && (
                        <div className="flex items-center space-x-1.5 text-amber-600 bg-amber-50/70 px-2 py-1 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Unsaved changes</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Direct Status selector mapping to workflow */}
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-2.5 py-1.5 text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="draft">Draft Status</option>
                    <option value="published">Publish Direct</option>
                  </select>

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveLoading ? "Saving..." : "Commit Changes"}</span>
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl p-3 flex items-center space-x-2 justify-center font-bold animate-in zoom-in duration-200">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Database Synchronization Completed!</span>
                </div>
              )}

              {/* MODULE 1: GATED EDITORIAL WORKFLOW FIELDS */}
              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                <h4 className="font-sans font-bold text-xs text-gray-800 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-indigo-500" />
                  <span>Workflow & Team Allocation</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-400 block">STATE</span>
                    <select
                      value={workflowState}
                      onChange={(e) => {
                        const val = e.target.value as Article['workflowState'];
                        setWorkflowState(val);
                        updateWorkflowStateOnBackend(val);
                      }}
                      className="w-full bg-white border border-gray-200 text-[11px] rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="Idea">💡 Idea</option>
                      <option value="Research">🔍 Research</option>
                      <option value="Outline">📝 Outline</option>
                      <option value="Draft">✍️ Draft</option>
                      <option value="AI Review">🤖 AI Review</option>
                      <option value="Editor Review">👁️ Editor Review</option>
                      <option value="SEO Review">🚀 SEO Review</option>
                      <option value="Scheduled">📅 Scheduled</option>
                      <option value="Published">🎉 Published</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-400 block">AUTHOR</span>
                    <select
                      value={assignedAuthor}
                      onChange={(e) => setAssignedAuthor(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-[11px] rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {authors.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-400 block">EDITOR</span>
                    <select
                      value={assignedEditor}
                      onChange={(e) => setAssignedEditor(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-[11px] rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {editors.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-400 block">DUE DATE</span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-[11px] rounded-lg px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-gray-400 block">EDITORIAL NOTES</span>
                  <textarea
                    rows={2}
                    value={editorialNotes}
                    onChange={(e) => setEditorialNotes(e.target.value)}
                    placeholder="Provide notes for the editor regarding content scope, references, or specific guidelines..."
                    className="w-full bg-white border border-gray-200 text-[11px] rounded-lg p-2 focus:outline-none placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Compose a high-click technology headline"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Category Selection</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="Technology">Technology</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Tags / Keywords</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="AI, Machine Learning, Coding"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Main Prose Draft (Supports Markdown)</label>
                    <button
                      type="button"
                      onClick={handleAiSummarize}
                      disabled={aiLoading}
                      className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-0.5 focus:outline-none"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>AI Generate Summary</span>
                    </button>
                  </div>
                  <textarea
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Draft article content. Utilize markdown syntax e.g. ## Subheadings, **bold**, *italics*, bullet items etc."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">Short Executive Summary</label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Provide a 2-sentence highlight. Autofilled by the AI Summarizer above."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 leading-normal focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* SEO Meta Fields */}
                <div className="border border-indigo-100/60 bg-indigo-50/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-900 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>SEO optimization values</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAiSeo}
                      disabled={aiLoading}
                      className="text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg flex items-center space-x-0.5 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>AI SEO Generate</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-indigo-400">SEO META TITLE</span>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Search Engine Title"
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 text-[11px] text-gray-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-indigo-400">SEO META DESCRIPTION</span>
                      <input
                        type="text"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Search Engine Snippet Summary"
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 text-[11px] text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* MODULE 1: LAUNCH CHECKLIST MANAGER */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 text-left">
              <div className="border-b border-gray-50 pb-2">
                <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <ListTodo className="w-5 h-5 text-indigo-500" />
                  <span>Launch Task Checklist</span>
                </h3>
                <p className="text-xs text-gray-400">Ensure absolute publication excellence before pushing to feed.</p>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {taskChecklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100/50">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-xs font-semibold ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.text}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="text-gray-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add custom publication check..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-xl text-xs"
                >
                  Add Task
                </button>
              </div>
            </div>

            {/* MODULE 2: COMPARATIVE REVISION VIEWER */}
            {selectedArticleId && revisions.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 text-left">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <History className="w-5 h-5 text-indigo-500" />
                    <span>Version History ({revisions.length})</span>
                  </h3>
                  <p className="text-xs text-gray-400">Restore or compare historical text states safely.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revision Selector List */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {revisions.map((rev, index) => (
                      <div
                        key={index}
                        onClick={() => setCompareRevision(rev)}
                        className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                          compareRevision?.timestamp === rev.timestamp
                            ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-bold'
                            : 'bg-gray-50/30 border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between text-[9px] text-gray-400 mb-0.5 font-mono">
                          <span>{new Date(rev.timestamp).toLocaleString()}</span>
                          <span className="text-indigo-600">Ver #{revisions.length - index}</span>
                        </div>
                        <h4 className="line-clamp-1">{rev.title}</h4>
                        <span className="text-[9px] text-slate-400 block mt-1">Author: {rev.author}</span>
                      </div>
                    ))}
                  </div>

                  {/* Comparative Diff Preview Box */}
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 max-h-48 overflow-y-auto flex flex-col justify-between">
                    {compareRevision ? (
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-center pb-1 border-b border-gray-200/60">
                          <span className="text-[9px] font-bold text-indigo-600 font-mono">REVISION INFO</span>
                          <button
                            onClick={() => handleRestoreRevision(compareRevision)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] px-2 py-0.5 rounded"
                          >
                            Restore Version
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800">{compareRevision.title}</h4>
                        <p className="text-[10px] text-gray-500 whitespace-pre-wrap leading-normal font-mono">
                          {compareRevision.content.substring(0, 300)}...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center justify-center gap-1">
                        <FileDiff className="w-6 h-6 text-gray-350" />
                        <span>Select a revision to compare and restore.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 1: AUDIT TRAILS ACTIVITY TIMELINE */}
            {selectedArticleId && activityHistory.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 text-left">
                <div className="border-b border-gray-50 pb-2">
                  <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <span>Audit Trail Log</span>
                  </h3>
                  <p className="text-xs text-gray-400">Strict temporal log tracking edits, publishes, and state transformations.</p>
                </div>

                <div className="relative border-l-2 border-indigo-100 pl-4 ml-2 space-y-4 max-h-40 overflow-y-auto">
                  {activityHistory.map((act, index) => (
                    <div key={index} className="relative">
                      {/* Circle icon */}
                      <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white"></span>
                      <div className="space-y-0.5">
                        <span className="font-mono text-[9px] text-gray-400">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                        <p className="text-xs font-semibold text-gray-700">{act.action}</p>
                        <span className="text-[9px] text-slate-400 font-medium">Actor: {act.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AI EDITORIAL ASSISTANT CO-PILOT (Module 11) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">AI Content Copilot</h3>
                  <span className="font-mono text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Gemini 3.5 Flash Engine</span>
                </div>
              </div>

              {/* Advanced AI Subnav selector tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none select-none">
                {[
                  { id: 'titles', label: 'Titles' },
                  { id: 'outlines', label: 'Outlines' },
                  { id: 'readability', label: 'Readability' },
                  { id: 'internal-links', label: 'Internal Links' },
                  { id: 'tone-check', label: 'Tone Check' },
                  { id: 'faqs', label: 'FAQ Block' },
                  { id: 'social-captions', label: 'Socials' },
                  { id: 'prompts', label: 'Library' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAiTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      activeAiTab === tab.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* AI loading feedback */}
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-[10px] text-slate-400">Consulting editorial AI...</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  
                  {/* Titles Generator */}
                  {activeAiTab === 'titles' && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Seo Keywords</span>
                        <input
                          type="text"
                          value={aiKeywordsInput}
                          onChange={(e) => setAiKeywordsInput(e.target.value)}
                          placeholder="Micro-saas, bootstrap, revenue"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAiTitles}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all"
                      >
                        Suggest Titles
                      </button>

                      {aiSuggestions.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/80 space-y-1.5 max-h-52 overflow-y-auto">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">Select to insert:</span>
                          {aiSuggestions.map((sug, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setTitle(sug);
                                setSeoTitle(sug);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-200 cursor-pointer font-semibold transition-colors"
                            >
                              {sug}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outlines Generator */}
                  {activeAiTab === 'outlines' && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Concept / Topic</span>
                        <input
                          type="text"
                          value={aiTopicInput}
                          onChange={(e) => setAiTopicInput(e.target.value)}
                          placeholder="Autonomous Agentic workflows"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAiOutline}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all"
                      >
                        Generate Outline Struct
                      </button>

                      {aiOutline && (
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-2 max-h-52 overflow-y-auto">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold">OUTLINE:</span>
                            <button
                              type="button"
                              onClick={() => setContent(c => c + "\n\n" + aiOutline)}
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold focus:outline-none"
                            >
                              + Append text
                            </button>
                          </div>
                          <pre className="text-[10px] text-slate-300 font-sans whitespace-pre-wrap leading-normal">
                            {aiOutline}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Readability Score */}
                  {activeAiTab === 'readability' && (
                    <div className="space-y-3 animate-in fade-in">
                      <p className="text-[10px] text-slate-400 leading-normal">Evaluate vocabulary parameters, estimated reads duration, and grade levels.</p>
                      <button
                        type="button"
                        onClick={handleAiReadability}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg"
                      >
                        Run Readability Check
                      </button>

                      {aiReadability && (
                        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-900 p-2 rounded-lg">
                              <span className="text-[9px] text-indigo-400 uppercase font-bold block">Accessibility</span>
                              <span className="text-xs font-bold text-white block">{aiReadability.gradeLevel}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded-lg">
                              <span className="text-[9px] text-indigo-400 uppercase font-bold block">Clarity Score</span>
                              <span className="text-xs font-bold text-white block">{aiReadability.score}/100</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-amber-400 uppercase font-bold block">Improvement Checklist:</span>
                            {aiReadability.suggestions?.map((s, i) => (
                              <div key={i} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE 4 / MODULE 11: INTERNAL LINKING INTEL */}
                  {activeAiTab === 'internal-links' && (
                    <div className="space-y-3 animate-in fade-in">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Gemini identifies high-relevance matches from your existing published catalog to place internal contextual hyperlinks.
                      </p>
                      <button
                        type="button"
                        onClick={handleAiInternalLinks}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg"
                      >
                        Analyze Linking Contexts
                      </button>

                      {aiInternalLinks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block">Link suggestions:</span>
                          {aiInternalLinks.map((rec, i) => {
                            const matchedDoc = articles.find(a => a.id === rec.targetArticleId);
                            return (
                              <div key={i} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-200">
                                  <span>Anchor: "{rec.anchorText}"</span>
                                  <span className="text-indigo-400 text-[9px] uppercase font-mono">ID: {rec.targetArticleId}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1">Destination: {matchedDoc?.title || "Published Article"}</p>
                                <p className="text-[9px] text-indigo-400 italic font-medium leading-normal">Why: {rec.contextHint}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE 11: TONE CHECK */}
                  {activeAiTab === 'tone-check' && (
                    <div className="space-y-3 animate-in fade-in">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Analyze linguistic tone, reading ease scoring, and emotional sentiment metrics.
                      </p>
                      <button
                        type="button"
                        onClick={handleAiToneCheck}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg"
                      >
                        Analyze Prose Tone
                      </button>

                      {aiToneAnalysis && (
                        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[9px] text-indigo-400 uppercase font-bold block">Dominant Voice</span>
                            <span className="text-xs font-bold text-white">{aiToneAnalysis.toneType}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-900 p-2 rounded-lg">
                              <span className="text-[9px] text-indigo-400 uppercase font-bold block">Reading Ease</span>
                              <span className="text-xs font-bold text-white block">{aiToneAnalysis.readingEaseScore}</span>
                            </div>
                            <div className="bg-slate-900 p-2 rounded-lg">
                              <span className="text-[9px] text-indigo-400 uppercase font-bold block">Sentiment</span>
                              <span className="text-xs font-bold text-white block">{aiToneAnalysis.sentiment}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-800">
                            <span className="text-[9px] text-amber-400 uppercase font-bold block mb-1">Critique & Improvement</span>
                            <p className="text-[10px] text-slate-300 leading-normal italic">"{aiToneAnalysis.editorialCritique}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE 11: FAQS BLOCK GENERATOR */}
                  {activeAiTab === 'faqs' && (
                    <div className="space-y-3 animate-in fade-in">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Generate a structured tech-focused Frequently Asked Questions block based on current draft content.
                      </p>
                      <button
                        type="button"
                        onClick={handleAiFaqs}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg"
                      >
                        Formulate FAQ Block
                      </button>

                      {aiFaqs.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono">FAQ Recommendations:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const faqMarkdown = "\n\n## Frequently Asked Questions\n\n" + aiFaqs.map(f => `### ${f.question}\n${f.answer}`).join("\n\n");
                                setContent(c => c + faqMarkdown);
                                alert("FAQs appended to editor!");
                              }}
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold"
                            >
                              + Append to Prose
                            </button>
                          </div>
                          {aiFaqs.map((faq, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                              <h5 className="font-bold text-xs text-slate-200">Q: {faq.question}</h5>
                              <p className="text-[10px] text-slate-400 leading-normal">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODULE 11: SOCIAL CAPTIONS */}
                  {activeAiTab === 'social-captions' && (
                    <div className="space-y-3 animate-in fade-in">
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Produce custom promotional taglines mapped for LinkedIn, X (Twitter), and email campaigns.
                      </p>
                      <button
                        type="button"
                        onClick={handleAiSocialCaptions}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-1.5 rounded-lg"
                      >
                        Generate Captions
                      </button>

                      {aiSocialCaptions && (
                        <div className="space-y-3">
                          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                              <span className="text-[9px] font-bold text-indigo-400 font-mono">LINKEDIN</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(aiSocialCaptions.linkedin || '');
                                  alert("LinkedIn copied!");
                                }}
                                className="text-[8px] text-indigo-400 hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-normal whitespace-pre-wrap font-sans">{aiSocialCaptions.linkedin}</p>
                          </div>

                          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                              <span className="text-[9px] font-bold text-indigo-400 font-mono">X / TWITTER</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(aiSocialCaptions.x || '');
                                  alert("X post copied!");
                                }}
                                className="text-[8px] text-indigo-400 hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-normal font-sans">"{aiSocialCaptions.x}"</p>
                          </div>

                          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                              <span className="text-[9px] font-bold text-indigo-400 font-mono">NEWSLETTER campaign INTRO</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(aiSocialCaptions.newsletter || '');
                                  alert("Newsletter copied!");
                                }}
                                className="text-[8px] text-indigo-400 hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-normal italic">"{aiSocialCaptions.newsletter}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Elite prompts library */}
                  {activeAiTab === 'prompts' && (
                    <div className="space-y-3 animate-in fade-in max-h-72 overflow-y-auto pr-1">
                      {aiPrompts.map((p) => (
                        <div key={p.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-slate-200 line-clamp-1">{p.title}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(p.template);
                                alert("Prompt template copied to your clipboard!");
                              }}
                              className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-indigo-400 hover:text-indigo-300 focus:outline-none"
                              title="Copy prompt"
                            >
                              <Clipboard className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">{p.description}</p>
                          <pre className="text-[9px] bg-slate-950 p-2 rounded border border-slate-900 text-indigo-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {p.template}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
