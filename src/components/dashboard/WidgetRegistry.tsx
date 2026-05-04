import React from 'react';
import { TrendingUp, Users, Activity, Target } from 'lucide-react';

export const StatsCard = ({ label, dataKey }: { label: string; dataKey: string }) => {
  const mockValues: Record<string, { value: string; trend: string; icon: any }> = {
    total_sales: { value: '$12,450', trend: '+12.5%', icon: TrendingUp },
    active_users: { value: '1,203', trend: '+5.2%', icon: Users },
    conversion_rate: { value: '3.2%', trend: '-0.4%', icon: Target },
  };

  const data = mockValues[dataKey] || { value: '0', trend: '0%', icon: Activity };
  const Icon = data.icon;

  return (
    <div className="glass-card p-6 rounded-[2rem] hover:bg-white/[0.05] transition-all group border border-white/5 shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
          data.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {data.trend}
        </span>
      </div>
      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold tracking-tight">{data.value}</h3>
    </div>
  );
};

export const ActivityLog = ({ label }: { label: string }) => {
  return (
    <div className="glass-card p-8 rounded-[2rem] border border-white/5 h-full flex flex-col shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold tracking-tight">{label}</h3>
        <button className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">View All</button>
      </div>
      <div className="flex-1 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start space-x-4 group cursor-pointer">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <div className="flex-1 border-b border-white/5 pb-4">
              <p className="text-sm font-bold group-hover:text-blue-400 transition-colors">New conversion session started</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Project Alpha • Instance A</p>
                <p className="text-[10px] text-white/20">2h ago</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FallbackWidget = ({ type }: { type: string }) => (
  <div className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/20 text-center">
    <p className="font-bold text-red-400 text-sm">Missing Component</p>
    <p className="text-[10px] text-white/20 uppercase mt-2">Type: {type}</p>
  </div>
);

export const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'stats-card': StatsCard,
  'activity-log': ActivityLog,
};
