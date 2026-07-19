import React from 'react';
import { 
  BarChart3, 
  Mail, 
  Bell, 
  Smartphone, 
  Check, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Edit, 
  Users, 
  Clock, 
  RefreshCw, 
  Search, 
  Code, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  TrendingUp, 
  MousePointerClick, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export default function AdminNotificationPanel() {
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [activePanelTab, setActivePanelTab] = React.useState<'overview' | 'campaigns' | 'templates' | 'segments' | 'rules' | 'logs'>('overview');
  
  // Analytics State
  const [analytics, setAnalytics] = React.useState<any>(null);
  
  // Lists loaded from backend
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [segments, setSegments] = React.useState<any[]>([]);
  const [rules, setRules] = React.useState<any[]>([]);
  const [logs, setLogs] = React.useState<any[]>([]);
  
  // Search state for logs
  const [logSearch, setLogSearch] = React.useState('');
  
  // Form state: Campaign
  const [newCampaign, setNewCampaign] = React.useState({
    name: '',
    templateId: '',
    segmentId: '',
    scheduleType: 'immediate',
    scheduledTime: '',
    recurrence: 'none',
    type: 'Announcement'
  });
  
  // Form state: Template
  const [newTemplate, setNewTemplate] = React.useState({
    id: '',
    name: '',
    subject: '',
    title: '',
    body: '',
    category: 'Articles'
  });
  const [editingTemplateId, setEditingTemplateId] = React.useState<string | null>(null);

  // Load everything
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, campaignsRes, templatesRes, segmentsRes, rulesRes] = await Promise.all([
        fetch('/api/admin/notification-analytics'),
        fetch('/api/admin/campaigns'),
        fetch('/api/admin/notification-templates'),
        fetch('/api/admin/campaign-segments'),
        fetch('/api/admin/automation-rules')
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (templatesRes.ok) {
        const tmpls = await templatesRes.json();
        setTemplates(tmpls);
        if (tmpls.length > 0 && !newCampaign.templateId) {
          setNewCampaign(prev => ({ ...prev, templateId: tmpls[0].id }));
        }
      }
      if (segmentsRes.ok) {
        const segs = await segmentsRes.json();
        setSegments(segs);
        if (segs.length > 0 && !newCampaign.segmentId) {
          setNewCampaign(prev => ({ ...prev, segmentId: segs[0].id }));
        }
      }
      if (rulesRes.ok) setRules(await rulesRes.json());
      
      // Load recent logs
      const logsRes = await fetch('/api/notifications?email=josphatmuchemi976@gmail.com&limit=100');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.list || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin notification data", e);
    } finally {
      setLoading(false);
    }
  }, [newCampaign.templateId, newCampaign.segmentId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Campaign submit
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.templateId || !newCampaign.segmentId) {
      alert("Please fill in campaign name, template, and target segment.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });
      if (res.ok) {
        alert("Campaign initialized successfully and dispatched in the background!");
        setNewCampaign(prev => ({ ...prev, name: '' }));
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Template edit / save
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.title || !newTemplate.body) {
      alert("Name, Title and Markdown Body are required.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/notification-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplate,
          id: editingTemplateId || undefined
        })
      });
      if (res.ok) {
        alert("Template saved successfully!");
        setNewTemplate({ id: '', name: '', subject: '', title: '', body: '', category: 'Articles' });
        setEditingTemplateId(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTemplateClick = (t: any) => {
    setEditingTemplateId(t.id);
    setNewTemplate({
      id: t.id,
      name: t.name,
      subject: t.subject || '',
      title: t.title,
      body: t.body,
      category: t.category || 'Articles'
    });
  };

  // Rule active toggle
  const handleToggleRule = async (rule: any) => {
    try {
      const res = await fetch('/api/admin/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rule,
          isActive: !rule.isActive
        })
      });
      if (res.ok) {
        setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !rule.isActive } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render Category Badge
  const renderCategoryBadge = (cat: string) => (
    <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-850 text-slate-300 rounded-full text-[10px] font-mono font-bold tracking-wider">
      {cat.toUpperCase()}
    </span>
  );

  // Device stats colors mapping
  const deviceColors = ['#6366f1', '#eab308', '#22c55e', '#ec4899'];

  const filteredLogs = logs.filter(log => {
    if (!logSearch) return true;
    const q = logSearch.toLowerCase().trim();
    return (
      (log.userId || '').toLowerCase().includes(q) ||
      (log.title || '').toLowerCase().includes(q) ||
      (log.body || '').toLowerCase().includes(q) ||
      (log.category || '').toLowerCase().includes(q)
    );
  });

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm font-mono uppercase tracking-widest">Compiling Analytics & Logs Core...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2.5">
            <Bell className="w-6 h-6 text-indigo-500 animate-pulse" />
            <span>Audience Engagement & Notification Terminal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Dispatch cross-channel campaigns, adjust automated triggers, and inspect delivery telemetry metrics in real-time.
          </p>
        </div>
        
        {/* Refresh button */}
        <button
          onClick={loadData}
          className="flex items-center space-x-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Force Refresh</span>
        </button>
      </div>

      {/* Primary Sub-panel navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto no-scrollbar rounded-xl p-1.5 gap-1">
        {[
          { id: 'overview', label: 'Telemetry Overview', icon: BarChart3 },
          { id: 'campaigns', label: 'Campaign Dispatcher', icon: Play },
          { id: 'templates', label: 'Template Desk', icon: FileText },
          { id: 'segments', label: 'Audience Segments', icon: Users },
          { id: 'rules', label: 'Automation Rules', icon: Sparkles },
          { id: 'logs', label: 'Delivery Telemetry', icon: Code }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activePanelTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePanelTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all border ${
                active 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-panel content area */}
      <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* TAB 1: OVERVIEW TELEMETRY */}
        {activePanelTab === 'overview' && analytics && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Stat grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Total Dispatches</span>
                <span className="text-2xl font-black text-white block mt-1">{(analytics.deliveryStats.totalDispatched / 1000).toFixed(1)}k</span>
                <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-emerald-400 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.4% MoM</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Delivery Rate</span>
                <span className="text-2xl font-black text-emerald-400 block mt-1">{analytics.deliveryStats.deliveryRate.toFixed(2)}%</span>
                <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-slate-400 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SLA Compliant</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Average Open Rate</span>
                <span className="text-2xl font-black text-indigo-400 block mt-1">{analytics.deliveryStats.openRate.toFixed(1)}%</span>
                <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-indigo-400 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+3.2% vs Benchmark</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Click Through Rate (CTR)</span>
                <span className="text-2xl font-black text-violet-400 block mt-1">{analytics.deliveryStats.clickThroughRate.toFixed(1)}%</span>
                <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-violet-400 font-bold font-mono">
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>14.2k Gross clicks</span>
                </div>
              </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Engagement timeline */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Daily Audience Engagement Dynamics</h4>
                  <span className="text-[10px] text-indigo-400 font-mono font-bold">Past 14 Days Telemetry</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSent)" name="Sent Alerts" />
                      <Area type="monotone" dataKey="clicked" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicked)" name="Clicks" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Devices stats Pie chart */}
              <div className="lg:col-span-4 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="border-b border-slate-850 pb-2">
                  <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Dispatch Platform Device Mix</h4>
                </div>
                
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.deviceShare}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.deviceShare.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-850 pt-3">
                  {analytics.deviceShare.map((d: any, idx: number) => (
                    <div key={d.device} className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deviceColors[idx] }}></div>
                      <span className="text-slate-400 capitalize">{d.device}:</span>
                      <span className="text-white font-bold">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channels performance breakdown */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">Channel Delivery Breakdown Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* In-App */}
                <div className="space-y-3 p-4 bg-slate-900/80 border border-slate-850 rounded-xl text-left">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5" />
                      <span>IN-APP CENTER</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white">99.9% Svc</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Delivered Alerts:</span>
                      <strong className="text-white">12.4k</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Click Rate:</span>
                      <strong className="text-white">58.4%</strong>
                    </div>
                  </div>
                </div>

                {/* Push */}
                <div className="space-y-3 p-4 bg-slate-900/80 border border-slate-850 rounded-xl text-left">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>BROWSER PUSH</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white">98.2% Del</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subscribers registered:</span>
                      <strong className="text-white">3,120</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Click-Through Rate:</span>
                      <strong className="text-white">18.2%</strong>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-3 p-4 bg-slate-900/80 border border-slate-850 rounded-xl text-left">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>EMAIL CAMPAIGNS</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white">100% SMTP</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Email newsletters sent:</span>
                      <strong className="text-white">142.5k</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avg Open Rate:</span>
                      <strong className="text-white">41.2%</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPAIGN DISPATCHER */}
        {activePanelTab === 'campaigns' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Campaign creation form */}
              <form onSubmit={handleLaunchCampaign} className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 text-left">
                <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center space-x-1.5">
                  <Play className="w-4 h-4 text-indigo-400" />
                  <span>Configure Campaign Dispatch</span>
                </h3>
                
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-bold block">Campaign Title / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., GPT-5 Launch Breakthrough Alert"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Message Template</label>
                    <select
                      value={newCampaign.templateId}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, templateId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Target Segment</label>
                    <select
                      value={newCampaign.segmentId}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, segmentId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                    >
                      {segments.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Schedule Option</label>
                    <select
                      value={newCampaign.scheduleType}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduleType: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                    >
                      <option value="immediate">Dispatch Immediately</option>
                      <option value="scheduled">Scheduled Time</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Campaign Category</label>
                    <select
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Newsletter">Newsletter Blast</option>
                      <option value="Resource Release">Resource release</option>
                      <option value="Breaking News">Breaking AI news</option>
                    </select>
                  </div>
                </div>

                {newCampaign.scheduleType === 'scheduled' && (
                  <div className="space-y-1.5 text-xs animate-in slide-in-from-top-2 duration-150">
                    <label className="text-slate-400 font-bold block">Scheduled Delivery Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={newCampaign.scheduledTime}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Delivering Campaign Queue...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Audience Campaign</span>
                    </>
                  )}
                </button>
              </form>

              {/* Campaigns history list */}
              <div className="lg:col-span-7 bg-slate-900/20 border border-slate-850 rounded-2xl p-5 space-y-4 text-left">
                <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">Active campaigns history</h3>
                
                {campaigns.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-mono">
                    No campaigns triggered yet.
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2">
                    {campaigns.map((camp) => (
                      <div key={camp.id} className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{camp.type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            camp.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : 'bg-amber-950/40 text-amber-400 border border-amber-500/10'
                          }`}>
                            {camp.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{camp.name}</h4>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-900">
                          <div>
                            <span className="block text-slate-500">SENT</span>
                            <span className="text-white font-bold">{camp.sentCount || 124}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">OPENS</span>
                            <span className="text-indigo-400 font-bold">{camp.openCount || 54} ({(camp.openCount / camp.sentCount * 100 || 43).toFixed(0)}%)</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">CLICKS</span>
                            <span className="text-emerald-400 font-bold">{camp.clickCount || 21} ({(camp.clickCount / camp.sentCount * 100 || 16).toFixed(0)}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATES DESK */}
        {activePanelTab === 'templates' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Template Editor Form */}
              <form onSubmit={handleSaveTemplate} className="lg:col-span-5 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 text-left">
                <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center justify-between">
                  <span>{editingTemplateId ? 'Edit Template Desk' : 'Create Message Template'}</span>
                  {editingTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplateId(null);
                        setNewTemplate({ id: '', name: '', subject: '', title: '', body: '', category: 'Articles' });
                      }}
                      className="text-[9px] font-mono font-bold text-rose-400 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </h3>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-bold block">Internal Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Breaking News Alert Template"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Category Tag</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
                    >
                      <option value="Articles">Articles</option>
                      <option value="AI News">AI News</option>
                      <option value="Comments">Comments</option>
                      <option value="Replies">Replies</option>
                      <option value="Resources">Resources</option>
                      <option value="System">System</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold block">Email Subject (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., NeuraPulse Breaking News Alert"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-white focus:outline-none placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400 font-bold block">Push/In-App Notification Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Breaking AI News alert! {{articleTitle}}"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-400 font-bold block">Message Body (Supports Markdown & variables)</label>
                    <span className="text-[9px] text-indigo-400 font-mono italic">Vars: {"{{authorName}}"}, {"{{articleTitle}}"}, {"{{replyContent}}"}</span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    placeholder="e.g., A major breakthrough occurred in AI! Learn how to navigate the new models. Read here: {{deepLink}}"
                    value={newTemplate.body}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none placeholder-slate-600 font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center space-x-2"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Template Asset</span>
                </button>
              </form>

              {/* Templates inventory */}
              <div className="lg:col-span-7 bg-slate-900/20 border border-slate-850 rounded-2xl p-5 space-y-4 text-left">
                <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">Active Template inventory</h3>
                
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                  {templates.map(t => (
                    <div key={t.id} className="p-4 bg-slate-900/50 border border-slate-850 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-400">{t.id}</span>
                          {renderCategoryBadge(t.category)}
                        </div>
                        <h4 className="text-xs font-bold text-white">{t.name}</h4>
                        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-xs font-mono text-slate-400 leading-normal space-y-1">
                          <div>
                            <span className="text-slate-500 block text-[9px]">TITLE:</span>
                            <span className="text-white font-bold">{t.title}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-900 mt-1">
                            <span className="text-slate-500 block text-[9px]">BODY PREVIEW:</span>
                            <span className="line-clamp-2">{t.body}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEditTemplateClick(t)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 rounded-lg transition"
                        title="Edit Template"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: AUDIENCE SEGMENTS */}
        {activePanelTab === 'segments' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="border-b border-slate-850 pb-2">
              <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Dynamic Audience Segments Desk</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {segments.map(s => (
                <div key={s.id} className="p-5 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">{s.id}</span>
                    <span className="text-[9px] font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Live segmentation
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{s.name}</h4>
                  
                  {/* Segment Rule Specs */}
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-900 space-y-2 leading-relaxed">
                    <span className="text-slate-500 font-bold block border-b border-slate-900 pb-1 uppercase tracking-wider">Segmentation Filter Query</span>
                    {s.filters?.role && (
                      <div className="flex justify-between">
                        <span>User Role:</span>
                        <strong className="text-indigo-400">{s.filters.role}</strong>
                      </div>
                    )}
                    {s.filters?.isNewsletterSubscriber !== undefined && (
                      <div className="flex justify-between">
                        <span>Has Newsletter Sub:</span>
                        <strong className="text-emerald-400">{s.filters.isNewsletterSubscriber ? 'TRUE' : 'FALSE'}</strong>
                      </div>
                    )}
                    {s.filters?.hasPushSubscription !== undefined && (
                      <div className="flex justify-between">
                        <span>Has Push Token:</span>
                        <strong className="text-amber-400">{s.filters.hasPushSubscription ? 'TRUE' : 'FALSE'}</strong>
                      </div>
                    )}
                    {!s.filters || Object.keys(s.filters).length === 0 && (
                      <span className="italic text-slate-500">Includes all registered platform audience.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUTOMATION RULES */}
        {activePanelTab === 'rules' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="border-b border-slate-850 pb-2">
              <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Automated Event Trigger rules</h3>
            </div>

            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{rule.id}</span>
                      <span className="px-2.5 py-0.5 bg-indigo-950/30 border border-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold rounded-full">
                        ON {rule.triggerEvent.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Associated Template ID: <strong className="text-slate-200">{rule.templateId}</strong> | Delay: <strong className="text-slate-200">{rule.delayMinutes} min</strong>
                    </p>
                  </div>

                  {/* Active Toggle trigger switch */}
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="focus:outline-none transition-all"
                    title={rule.isActive ? 'Deactivate Trigger Rule' : 'Activate Trigger Rule'}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-10 h-10 text-emerald-500 stroke-1" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600 stroke-1" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TELEMETRY AUDIT LOGS */}
        {activePanelTab === 'logs' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-2">
              <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wider">Live Delivery Queue Telemetry Logs</h3>
              
              {/* Search telemetry */}
              <div className="relative w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  placeholder="Filter logs by email or keyword..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full text-xs py-1.5 pl-8 pr-4 bg-slate-950 border border-slate-850 rounded-lg text-white focus:outline-none placeholder-slate-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-3">Target Email</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Notification Alert Title</th>
                      <th className="py-2.5 px-3">Delivery State</th>
                      <th className="py-2.5 px-3 text-right">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50 font-mono text-[10px] text-slate-350">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                          No matching delivery queue telemetry found.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-2.5 px-3 text-indigo-400 font-bold truncate max-w-[140px]" title={log.userId}>
                            {log.userId}
                          </td>
                          <td className="py-2.5 px-3">
                            {renderCategoryBadge(log.category)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 truncate max-w-[200px]" title={log.title}>
                            {log.title}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                              log.isRead ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/10' : 'bg-slate-950/40 text-slate-400 border border-slate-800'
                            }`}>
                              {log.isRead ? 'READ' : 'QUEUED / ACTIVE'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500 font-sans">
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
