import React from 'react';
import { 
  Users, 
  Briefcase, 
  AlertCircle, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { useDashboard } from '@/src/hooks/useDashboard';
import { formatDate, truncateUUID, cn } from '@/src/utils';
import { Badge } from '@/src/components/Badge';
import { Spinner } from '@/src/components/Spinner';

const COLORS = ['#94a3b8', '#3b82f6', '#6366f1', '#10b981', '#ef4444', '#f59e0b'];

export function Dashboard() {
  const { data: stats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Passengers', value: stats?.totalPassengers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Baggage', value: stats?.totalBaggage || 0, icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Active Claims', value: stats?.activeClaims || 0, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Recent Events', value: stats?.recentTrackingEvents || 0, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", card.bg)}>
                <card.icon size={24} className={card.color} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={12} />
                12%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Baggage Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <button className="text-sm font-bold text-blue-500 hover:text-blue-600">View All</button>
          </div>
          
          <div className="space-y-6">
            {/* Recent Baggage */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Baggage</h4>
              <div className="space-y-3">
                {stats?.recentActivity.baggage.map((bag) => (
                  <div key={bag.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{bag.barcode}</p>
                        <p className="text-xs text-slate-500">{bag.flightNumber} • {bag.origin} → {bag.destination}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge status={bag.status} />
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                        <Clock size={10} />
                        {formatDate(bag.lastUpdated)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Claims */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Claims</h4>
              <div className="space-y-3">
                {stats?.recentActivity.claims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Claim #{truncateUUID(claim.id)}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{claim.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Badge status={claim.claimType} />
                        <Badge status={claim.status} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                        <Clock size={10} />
                        {formatDate(claim.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


