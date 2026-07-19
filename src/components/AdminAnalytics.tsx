import React from 'react';
import { LayoutDashboard, TrendingUp, Users, ArrowUpRight, FolderOpen, Heart, ShieldAlert, Award, DollarSign, Wallet, Percent, Sparkles, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsMetrics } from '../types';

interface AdminAnalyticsProps {
  userRole: string;
}

export default function AdminAnalytics({ userRole }: AdminAnalyticsProps) {
  const [metrics, setMetrics] = React.useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const hasAccess = ['editor', 'admin'].includes(userRole);

  React.useEffect(() => {
    if (!hasAccess) return;

    fetch('/api/analytics/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load metrics');
        return res.json();
      })
      .then((data) => setMetrics(data))
      .catch((err) => setError(err.message || 'Error occurred'))
      .finally(() => setLoading(false));
  }, [userRole]);

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="inline-flex p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-full shadow-inner animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-sans font-extrabold text-xl text-gray-900">Analytics Board Gated</h2>
          <p className="font-sans text-xs text-gray-500 leading-relaxed">
            Global metrics, affiliate revenue breakdowns, and subscriber data are protected.
          </p>
          <div className="bg-slate-50 border border-gray-100 p-4 rounded-2xl mt-4">
            <span className="font-mono text-[10px] uppercase font-bold text-gray-400 block mb-1">Access Instructions:</span>
            <p className="text-[11px] text-indigo-600 font-semibold leading-normal">
              Switch your profile role to <strong>Editor</strong> or <strong>Administrator</strong> using the header selector to inspect live statistics!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Decrypting financial telemetry...</p>
      </div>
    );
  }

  if (!metrics) return null;

  // Custom static category data for pure CSS charting
  const chartData = [
    { category: 'AI', percentage: 78, color: 'bg-indigo-600', views: '2.4K' },
    { category: 'Entrepreneurship', percentage: 62, color: 'bg-violet-500', views: '1.9K' },
    { category: 'Productivity', percentage: 54, color: 'bg-emerald-500', views: '1.6K' },
    { category: 'Technology', percentage: 38, color: 'bg-amber-500', views: '1.1K' },
  ];

  const categoryDistribution = React.useMemo(() => {
    if (!metrics || !metrics.articlePerformance) return [];
    const counts: Record<string, number> = {};
    metrics.articlePerformance.forEach((art) => {
      let cat = art.category || 'Uncategorized';
      cat = cat.trim();
      if (cat.toLowerCase() === 'artificial-intelligence' || cat.toLowerCase() === 'ai') {
        cat = 'AI';
      } else if (cat.toLowerCase() === 'entrepreneurship') {
        cat = 'Entrepreneurship';
      } else if (cat.toLowerCase() === 'productivity') {
        cat = 'Productivity';
      } else if (cat.toLowerCase() === 'technology') {
        cat = 'Technology';
      } else {
        cat = cat.charAt(0).toUpperCase() + cat.slice(1);
      }
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [metrics]);

  const PIE_COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 text-white p-2.5 rounded-xl shadow-lg text-xs font-sans">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-indigo-300 mt-0.5 font-mono">{payload[0].value} {payload[0].value === 1 ? 'article' : 'articles'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* Header telemetry info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight flex items-center space-x-2">
            <LayoutDashboard className="w-7 h-7 text-indigo-600 shrink-0" />
            <span>Operational Telemetry Dashboard</span>
          </h1>
          <p className="font-sans text-xs text-gray-500 mt-1">
            Real-time subscriber aggregates, article performance spreadsheets, and transactional revenue streams.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100/40 rounded-full text-indigo-700 text-xs font-semibold self-start">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Telemetries Synced: Live</span>
        </div>
      </div>

      {/* Numerical Meters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block leading-none mb-1">Total Views</span>
            <span className="text-xl font-black text-gray-900">{metrics.totalViews}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shrink-0">
            <Heart className="w-5 h-5 fill-rose-150 stroke-rose-500" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block leading-none mb-1">Total Likes</span>
            <span className="text-xl font-black text-gray-900">{metrics.totalLikes}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block leading-none mb-1">Subscribers</span>
            <span className="text-xl font-black text-gray-900">{metrics.subscribersCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block leading-none mb-1">Downloads</span>
            <span className="text-xl font-black text-gray-900">{metrics.totalDownloads}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue streams module */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Revenue Channels</span>
            </h3>
            <span className="text-[10px] text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              Monthly Active
            </span>
          </div>

          <div className="space-y-4">
            <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl py-5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Gross Revenue</span>
              <span className="text-3xl font-black text-indigo-900 block mt-1">{metrics.revenueMetrics.totalRevenue}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-gray-600">Premium memberships</span>
                </div>
                <span className="font-bold text-slate-800">{metrics.revenueMetrics.breakdown.memberships}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-violet-500 shrink-0" />
                  <span className="font-semibold text-gray-600">Sponsored postings</span>
                </div>
                <span className="font-bold text-slate-800">{metrics.revenueMetrics.breakdown.sponsorships}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Percent className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-gray-600">Affiliate directories</span>
                </div>
                <span className="font-bold text-slate-800">{metrics.revenueMetrics.breakdown.affiliates}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Traffic Chart Module */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Views by Curated Category</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400">July cohort telemetry</span>
          </div>

          <div className="space-y-4">
            {chartData.map((cd, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{cd.category}</span>
                  <span className="font-mono text-gray-400">{cd.views} views</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${cd.color}`}
                    style={{ width: `${cd.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Article Distribution Pie Chart Module */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Article Distribution</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                By Category
              </span>
            </div>

            <div className="h-[200px] w-full flex items-center justify-center relative mt-2 select-none">
              {categoryDistribution.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No article data available</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Clean Custom Grid Legend */}
          {categoryDistribution.length > 0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-gray-50">
              {categoryDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-[11px] min-w-0">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-gray-600 truncate font-semibold">{entry.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-[10px] pl-1 shrink-0">{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Spreadsheet grid for individual article performances */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-sans font-bold text-sm text-gray-900">Article-Level Audit Telemetry</h3>
        <p className="text-xs text-gray-400 leading-none">
          Track readers interest vectors and conversion loops across all published assets.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-mono uppercase tracking-wide">
                <th className="p-3.5 font-bold">Article headline</th>
                <th className="p-3.5 font-bold">Category</th>
                <th className="p-3.5 font-bold text-right">Views count</th>
                <th className="p-3.5 font-bold text-right">Likes count</th>
                <th className="p-3.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {metrics.articlePerformance.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-800 max-w-xs truncate">{art.title}</td>
                  <td className="p-3.5 text-indigo-600 font-semibold">{art.category}</td>
                  <td className="p-3.5 font-mono text-right font-bold text-gray-700">{art.views}</td>
                  <td className="p-3.5 font-mono text-right text-rose-500 font-bold">{art.likes}</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-bold text-[10px]">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
