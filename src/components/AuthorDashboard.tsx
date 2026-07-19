import React from 'react';
import { 
  Trophy, BookOpen, Heart, Eye, Activity, CheckSquare, Square, 
  Plus, ChevronRight, Calendar, Flame, Sparkles, Clock, ArrowRight, 
  Edit3, User, BarChart2, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { Article, TaskChecklistItem } from '../types';

interface AuthorDashboardProps {
  articles: Article[];
  onRefreshArticles: () => Promise<void>;
  onEditArticle: (article: Article) => void;
  userRole: string;
}

export default function AuthorDashboard({ articles, onRefreshArticles, onEditArticle, userRole }: AuthorDashboardProps) {
  // Author choices
  const authorsList = ['Sarah Chen', 'Marcus Vance', 'Elena Rostova', 'Global Admin', 'Site Editor'];
  
  // Default logged in author is Sarah Chen or matching the role
  const [selectedAuthor, setSelectedAuthor] = React.useState<string>(
    userRole === 'admin' ? 'Global Admin' : 'Sarah Chen'
  );

  // New task text inputs per draft article
  const [newTaskTexts, setNewTaskTexts] = React.useState<Record<string, string>>({});
  const [taskSubmitting, setTaskSubmitting] = React.useState<string | null>(null);

  // Filter articles for current simulated author
  const authorArticles = articles.filter(a => 
    a.assignedAuthor === selectedAuthor || a.authorName === selectedAuthor
  );

  // Compute stats
  const publishedArticles = authorArticles.filter(a => a.workflowState === 'Published' || a.status === 'published');
  const activeDrafts = authorArticles.filter(a => a.workflowState !== 'Published' && a.status !== 'published');
  
  const totalViews = authorArticles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
  const totalLikes = authorArticles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
  
  // Word count sum
  const totalWords = authorArticles.reduce((acc, a) => {
    const wordCount = a.content ? a.content.split(/\s+/).filter(Boolean).length : 0;
    return acc + wordCount;
  }, 0);

  // Writing Goal
  const WRITING_GOAL = 12000;
  const goalPercentage = Math.min(100, Math.round((totalWords / WRITING_GOAL) * 100));

  // Extract all pending checklist tasks across all active articles for this author
  const assignedTasks = authorArticles.flatMap(a => {
    const list = a.taskChecklist || [];
    return list.map(item => ({
      articleId: a.id,
      articleTitle: a.title,
      task: item
    }));
  });

  const pendingTasks = assignedTasks.filter(t => !t.task.done);
  const completedTasks = assignedTasks.filter(t => t.task.done);

  // Handle toggling checklist task item in backend via the PATCH workflow API
  const handleToggleTask = async (articleId: string, itemId: string, currentDone: boolean) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const currentChecklist = article.taskChecklist || [];
    const updatedChecklist = currentChecklist.map(t => 
      t.id === itemId ? { ...t, done: !currentDone } : t
    );

    try {
      const res = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskChecklist: updatedChecklist,
          activityItem: {
            action: `Toggled task in author dashboard: "${currentChecklist.find(c => c.id === itemId)?.text}"`,
            user: selectedAuthor
          }
        })
      });

      if (res.ok) {
        await onRefreshArticles();
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  // Add a new task directly to a specific draft from the dashboard
  const handleAddNewTask = async (articleId: string) => {
    const taskText = newTaskTexts[articleId]?.trim();
    if (!taskText) return;

    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    setTaskSubmitting(articleId);

    const currentChecklist = article.taskChecklist || [];
    const newTask: TaskChecklistItem = {
      id: `chk-${Date.now()}`,
      text: taskText,
      done: false
    };
    const updatedChecklist = [...currentChecklist, newTask];

    try {
      const res = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskChecklist: updatedChecklist,
          activityItem: {
            action: `Added checklist task: "${taskText}"`,
            user: selectedAuthor
          }
        })
      });

      if (res.ok) {
        setNewTaskTexts(prev => ({ ...prev, [articleId]: '' }));
        await onRefreshArticles();
      }
    } catch (err) {
      console.error("Failed to add new task", err);
    } finally {
      setTaskSubmitting(null);
    }
  };

  // Fast workflow state transition
  const handleTransitionWorkflow = async (articleId: string, currentStage: string) => {
    const stages: Article['workflowState'][] = [
      'Idea', 'Research', 'Outline', 'Draft', 'AI Review', 
      'Editor Review', 'SEO Review', 'Scheduled', 'Published'
    ];
    
    const currentIndex = stages.indexOf(currentStage as any);
    if (currentIndex === -1 || currentIndex === stages.length - 1) return;
    
    const nextStage = stages[currentIndex + 1];

    try {
      const res = await fetch(`/api/articles/${articleId}/workflow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowState: nextStage,
          activityItem: {
            action: `Fast-transitioned draft state to: ${nextStage}`,
            user: selectedAuthor
          }
        })
      });

      if (res.ok) {
        await onRefreshArticles();
      }
    } catch (err) {
      console.error("Failed to transition workflow", err);
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-sans font-black text-xl text-gray-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-600" />
            <span>Author Performance Hub</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Displaying writing velocity, assigned workflows, editorial checklists, and dynamic draft summaries.
          </p>
        </div>

        {/* Dynamic Simulated Author Switcher */}
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-2xl">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 font-bold">Simulate Author:</span>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="text-xs font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer focus:outline-none"
          >
            {authorsList.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personal Writing Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-0.5">Author Views</span>
            <span className="text-xl font-black text-gray-900">{totalViews.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shrink-0">
            <Heart className="w-5 h-5 fill-rose-50 stroke-rose-500" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-0.5">Author Likes</span>
            <span className="text-xl font-black text-gray-900">{totalLikes.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-0.5">Publications</span>
            <span className="text-xl font-black text-gray-900">{publishedArticles.length}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-0.5">Active Drafts</span>
            <span className="text-xl font-black text-gray-900">{activeDrafts.length}</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stats Details & Checklist Tasks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Writing Goals Progress Card */}
          <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-indigo-950 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-950 pb-2">
              <h3 className="font-sans font-bold text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Monthly Word Goal</span>
              </h3>
              <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-bold px-2 py-0.5 rounded-lg">
                Active
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black">{totalWords.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400">of {WRITING_GOAL.toLocaleString()} words</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-indigo-950 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{goalPercentage}% Goal Reached</span>
                {goalPercentage >= 100 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target Achieved!
                  </span>
                ) : (
                  <span>{(WRITING_GOAL - totalWords > 0 ? WRITING_GOAL - totalWords : 0).toLocaleString()} words left</span>
                )}
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex items-start gap-2 text-left">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-300 leading-normal">
                {goalPercentage >= 100 
                  ? "Outstanding velocity! You have completed your writing metrics for this publication cycle. Keep pushing the boundaries of AI integration!"
                  : "Keep drafting and using the AI Content Copilot to expand outline blueprints and maximize high-leverage outcomes."
                }
              </p>
            </div>
          </div>

          {/* Assigned Editorial Tasks */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>My Editorial Tasks</span>
                </h3>
                <p className="text-[10px] text-gray-400">Action items assigned across your drafts.</p>
              </div>
              <span className="text-[10px] bg-indigo-50 font-bold text-indigo-700 px-2.5 py-1 rounded-full">
                {pendingTasks.length} Pending
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-gray-600">All caught up!</p>
                <p className="text-[10px] text-gray-400">No pending task requirements for your assigned list.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {pendingTasks.map((t, idx) => (
                  <div 
                    key={`${t.articleId}-${t.task.id}-${idx}`}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-100/60 text-xs flex items-start gap-3 transition-all hover:bg-gray-100/40"
                  >
                    <button
                      onClick={() => handleToggleTask(t.articleId, t.task.id, false)}
                      className="text-gray-400 hover:text-indigo-600 focus:outline-none shrink-0 mt-0.5"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800 leading-normal">{t.task.text}</p>
                      <span className="text-[9px] text-indigo-600 font-semibold block leading-none">
                        Ref: {t.articleTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="pt-2 border-t border-gray-50">
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block mb-2">Completed Tasks ({completedTasks.length})</span>
                <div className="space-y-1.5 max-h-28 overflow-y-auto scrollbar-thin opacity-60">
                  {completedTasks.map((t, idx) => (
                    <div 
                      key={`comp-${idx}`}
                      className="flex items-start gap-2 text-[11px] text-gray-500 pl-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-through line-clamp-1">{t.task.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Active Drafts Management Table */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-gray-50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Assigned Active Drafts</span>
                </h3>
                <p className="text-xs text-gray-400">Maintain drafts, progress states, due dates, and update checklists instantly.</p>
              </div>

              <div className="text-xs text-gray-500">
                Total drafts in pipeline: <span className="font-bold text-gray-900">{activeDrafts.length}</span>
              </div>
            </div>

            {activeDrafts.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-600">No active drafts found.</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  All your assigned articles have already transitioned to the Published catalog! Create a new one inside the Studio Workspace to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeDrafts.map((art) => {
                  const draftWords = art.content ? art.content.split(/\s+/).filter(Boolean).length : 0;
                  const draftChecklist = art.taskChecklist || [];
                  const completedTasksCount = draftChecklist.filter(c => c.done).length;
                  const percentChecklist = draftChecklist.length > 0
                    ? Math.round((completedTasksCount / draftChecklist.length) * 100)
                    : 0;

                  return (
                    <div 
                      key={art.id}
                      className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 space-y-4 transition-all hover:bg-gray-50"
                    >
                      
                      {/* Draft Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                              {art.workflowState || 'Idea'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {art.category}
                            </span>
                          </div>
                          <h4 className="font-sans font-extrabold text-sm text-gray-900">
                            {art.title}
                          </h4>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTransitionWorkflow(art.id, art.workflowState || 'Idea')}
                            disabled={art.workflowState === 'Published'}
                            className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <span>Advance Stage</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => onEditArticle(art)}
                            className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Draft</span>
                          </button>
                        </div>
                      </div>

                      {/* Draft Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white border border-gray-100/80 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block mb-0.5">Word count</span>
                          <span className="font-bold text-gray-800">{draftWords} words</span>
                        </div>
                        <div className="bg-white border border-gray-100/80 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block mb-0.5">Due date</span>
                          <span className="font-bold text-gray-800">{art.dueDate ? new Date(art.dueDate).toLocaleDateString() : 'None set'}</span>
                        </div>
                        <div className="bg-white border border-gray-100/80 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 uppercase font-bold block mb-0.5">Checklist</span>
                          <span className="font-bold text-gray-800">{percentChecklist}% ({completedTasksCount}/{draftChecklist.length})</span>
                        </div>
                      </div>

                      {/* Editorial Checklist item addition & listing */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Draft Checklist Tasks:</span>
                          
                          {/* Mini Add Task Form */}
                          <div className="flex items-center gap-1.5 max-w-xs w-full">
                            <input 
                              type="text"
                              value={newTaskTexts[art.id] || ''}
                              onChange={(e) => setNewTaskTexts(prev => ({ ...prev, [art.id]: e.target.value }))}
                              placeholder="Assign new task..."
                              className="text-[10px] bg-white border border-gray-100 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 w-full focus:outline-none"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddNewTask(art.id)}
                            />
                            <button
                              onClick={() => handleAddNewTask(art.id)}
                              disabled={taskSubmitting === art.id}
                              className="text-[10px] bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 p-1 rounded-lg shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* List items with inline checkboxes */}
                        {draftChecklist.length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic">No checklist items defined for this draft.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                            {draftChecklist.map((item) => (
                              <div 
                                key={item.id}
                                className="flex items-center gap-2 p-1.5 bg-white border border-gray-100/60 rounded-xl"
                              >
                                <button
                                  onClick={() => handleToggleTask(art.id, item.id, item.done)}
                                  className={`focus:outline-none shrink-0 ${item.done ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-600'}`}
                                >
                                  {item.done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <span className={`text-[11px] truncate ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
