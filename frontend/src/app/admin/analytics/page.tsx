"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Lightbulb,
  ChevronRight
} from "lucide-react";
import api from "@/services/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics/dashboard");
        setData(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tatt-lime"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 animate-in fade-in duration-500 pt-6">
      <main className="max-w-[1600px] mx-auto p-4 md:p-10 space-y-10">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
             label="Total Daily Traffic" 
             value={data?.kpis?.totalTraffic?.value?.toLocaleString()} 
             change={data?.kpis?.totalTraffic?.change} 
             isPositive={data?.kpis?.totalTraffic?.isPositive} 
          />
          <KPICard 
             label="Community Engagement" 
             value={data?.kpis?.engagement?.value} 
             change={data?.kpis?.engagement?.change} 
             isPositive={data?.kpis?.engagement?.isPositive} 
          />
          <KPICard 
             label="Network Connections" 
             value={data?.kpis?.newConnections?.value?.toLocaleString()} 
             change={data?.kpis?.newConnections?.change} 
             isPositive={data?.kpis?.newConnections?.isPositive} 
          />
          <KPICard 
             label="Active Subscriptions" 
             value={data?.kpis?.totalSubscriptions?.value?.toLocaleString()} 
             change={data?.kpis?.totalSubscriptions?.change} 
             isPositive={data?.kpis?.totalSubscriptions?.isPositive} 
          />
        </div>

        {/* Charting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Community Growth Card */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm space-y-8">
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-2xl font-black tracking-tighter italic uppercase text-foreground">Community Pulse</h2>
                   <p className="text-xs font-black text-tatt-gray uppercase tracking-widest mt-1">Daily Traffic vs Engagement Posts</p>
                </div>
                <div className="flex gap-4">
                   <LegendItem color="bg-tatt-lime" label="Traffic" />
                   <LegendItem color="bg-tatt-black" label="Posts" />
                </div>
             </div>
             
             {/* Simplified Trend Visual */}
             <div className="relative h-64 w-full flex items-end">
                <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                   <div className="border-b border-foreground w-full shadow-sm" />
                   <div className="border-b border-foreground w-full opacity-50" />
                   <div className="border-b border-foreground w-full opacity-30" />
                   <div className="border-b border-foreground w-full opacity-10" />
                </div>
                
                <div className="flex-1 flex items-end justify-around gap-2 h-full z-10 px-4">
                   {data?.trends?.signups?.map((val: number, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-2 w-full group">
                         <div 
                           className="w-4 bg-tatt-lime rounded-t-lg transition-all group-hover:brightness-110 shadow-[0_0_15px_rgba(159,204,0,0.3)]"
                           style={{ height: `${(val / (Math.max(...data.trends.signups) || 1)) * 100}%` }}
                         />
                         <div 
                           className="w-4 bg-tatt-black rounded-b-lg transition-all"
                           style={{ height: `${(data.trends.posts[i] / (Math.max(...data.trends.posts) || 1)) * 60}%` }}
                         />
                      </div>
                   ))}
                </div>
             </div>
             <div className="flex justify-between text-[10px] font-black text-tatt-gray uppercase tracking-widest px-2">
                {data?.trends?.labels?.map((l: string) => <span key={l}>{new Date(l).toLocaleDateString("en-US", { weekday: "short" })}</span>)}
             </div>
          </div>

          {/* Subscription Dynamics Card */}
          <div className="bg-tatt-black text-white rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
             <div className="absolute -right-20 -top-20 size-64 bg-tatt-lime-dark rounded-full blur-[100px] opacity-20 pointer-events-none" />
             
             <div className="flex justify-between items-start relative z-10">
                <div>
                   <h2 className="text-2xl font-black tracking-tighter italic uppercase text-white">Migration Dynamics</h2>
                   <p className="text-xs font-black text-tatt-gray uppercase tracking-widest mt-1">Tier Progression Flow</p>
                </div>
                <select className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1.5 outline-none text-white">
                   <option>30 Day Window</option>
                </select>
             </div>

             <div className="space-y-10 relative z-10 py-4">
                <TierMigration 
                  label="Ubuntu" 
                  to="Imani" 
                  count={data?.subscriptions?.ubuntuToImani} 
                  percent={data?.subscriptions?.migrationVelocity || 0} 
                />
                <TierMigration 
                  label="Imani" 
                  to="Kiongozi" 
                  count={data?.subscriptions?.imaniToKiongozi} 
                  percent={data?.subscriptions?.retentionVelocity || 0} 
                />
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-6">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-tatt-lime text-tatt-black rounded-lg">
                         <Lightbulb className="size-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Growth Intelligence</span>
                   </div>
                   <p className="text-sm font-medium leading-relaxed text-white/60 italic">
                     Upgrades from Ubuntu to Imani are currently at a 6-month high. Recommend activating localized rewards for regional segments.
                   </p>
                </div>
             </div>
          </div>

        </div>

        {/* Chapters Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-sm p-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                 <h2 className="text-2xl font-black tracking-tighter italic uppercase text-foreground">Top Chapters Performance</h2>
                 <p className="text-xs font-black text-tatt-gray uppercase tracking-widest mt-1">Growth rate vs Active Presence</p>
              </div>
              <button className="px-6 py-2.5 bg-background text-foreground border border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-border transition-colors">
                Regional Reports
              </button>
           </div>
           
           <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-tatt-gray uppercase tracking-widest border-b border-border">
                       <th className="pb-4">Region Chapter</th>
                       <th className="pb-4">Growth Curve</th>
                       <th className="pb-4">Active Corps</th>
                       <th className="pb-4">Action Status</th>
                       <th className="pb-4 text-right">Performance</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {data?.chapters?.map((chap: any, idx: number) => (
                       <tr key={idx} className="border-b border-border hover:bg-background/5 transition-colors group">
                          <td className="py-6 font-black italic">{chap.name}</td>
                          <td className="py-6 font-black text-tatt-lime">{chap.growth}</td>
                          <td className="py-6 font-bold">{chap.members?.toLocaleString()}</td>
                          <td className="py-6">
                             <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${chap.status === 'EXCELLING' ? 'bg-tatt-lime/10 text-tatt-lime' : 'bg-background text-tatt-gray'}`}>
                                {chap.status}
                             </span>
                          </td>
                          <td className="py-6 text-right">
                             <div className="w-24 h-1.5 bg-border rounded-full ml-auto overflow-hidden">
                                <div className="h-full bg-tatt-lime" style={{ width: chap.status === 'EXCELLING' ? '85%' : '40%' }} />
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </main>
    </div>
  );
}

function KPICard({ label, value, change, isPositive }: { label: string, value: string, change: string, isPositive: boolean }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm hover:border-tatt-lime/50 transition-all group">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">{label}</span>
           <Activity className="size-4 text-tatt-gray group-hover:text-tatt-lime transition-colors" />
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-black italic tracking-tighter text-foreground">{value}</div>
          <div className={`flex items-center gap-1 text-[10px] font-black italic ${isPositive ? 'text-tatt-lime' : 'text-tatt-error'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`size-2.5 rounded-full ${color}`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">{label}</span>
    </div>
  )
}

function TierMigration({ label, to, count, percent }: { label: string, to: string, count: number, percent: number | string }) {
  return (
    <div className="space-y-3">
       <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
             <span className="text-sm font-bold opacity-60 uppercase text-white">{label}</span>
             <ChevronRight size={14} className="opacity-40 text-white" />
             <span className="text-sm font-black italic text-white">{to}</span>
          </div>
          <div className="text-2xl font-black italic text-tatt-lime">{count || 0}</div>
       </div>
       <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-tatt-lime shadow-[0_0_10px_#9fcc00]" style={{ width: `${Math.min((count || 0) * 5, 100)}%` }} />
       </div>
       <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Migration Velocity: {percent}%</div>
    </div>
  )
}
