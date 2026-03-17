import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { CalendarDays, ClipboardList, Users, TrendingUp, Star } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { StatCardSkeleton } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge, { eventStatusVariant, eventStatusLabel } from '../../components/ui/Badge.jsx';

import { getOverview, getEventAnalytics, getRegistrationTrends } from '../../api/analytics.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/50 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-card">
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-bold text-lime">{payload[0].value} registration{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const Analytics = () => {
  const { data: overviewData, isLoading: loadingOverview } = useQuery({ queryKey: ['analytics-overview'], queryFn: getOverview });
  const { data: eventData, isLoading: loadingEvents } = useQuery({ queryKey: ['analytics-events'], queryFn: getEventAnalytics });
  const { data: trendsData, isLoading: loadingTrends } = useQuery({ queryKey: ['analytics-trends'], queryFn: getRegistrationTrends });

  const overview = overviewData?.data ?? {};
  const events   = eventData?.data?.events ?? [];
  const rawTrends = trendsData?.data?.trends ?? [];
  const chartData = rawTrends.map((t) => ({ date: format(parseISO(t.date), 'MMM d'), count: t.count }));

  const stats = [
    { title: 'Total Events',        value: loadingOverview ? '—' : overview.totalEvents ?? 0,        icon: CalendarDays,  color: 'purple', trend: overview.upcomingEvents != null ? { value: `${overview.upcomingEvents} upcoming`, isPositive: true } : undefined },
    { title: 'Total Registrations', value: loadingOverview ? '—' : overview.totalRegistrations ?? 0, icon: ClipboardList, color: 'blue' },
    { title: 'Active Students',     value: loadingOverview ? '—' : overview.totalStudents ?? 0,      icon: Users,         color: 'green' },
    { title: 'Attendance Rate',     value: loadingOverview ? '—' : `${overview.attendanceRate ?? 0}%`, icon: TrendingUp, color: 'amber', trend: overview.avgRating != null ? { value: `${overview.avgRating}★ avg rating`, isPositive: overview.avgRating >= 3.5 } : undefined },
  ];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Insights across all events and registrations" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loadingOverview ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />) : stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Chart */}
      <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-display text-xl text-white tracking-[2px] mb-5">REGISTRATIONS — LAST 30 DAYS</h2>
        {loadingTrends ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : chartData.every((d) => d.count === 0) ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted">No registrations in the last 30 days.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D1050" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8B6BA8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#8B6BA8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#AAFF0011' }} />
              <Bar dataKey="count" fill="#AAFF00" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Events breakdown */}
      <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-raised">
          <h2 className="text-display text-xl text-white tracking-[2px]">EVENTS BREAKDOWN</h2>
        </div>
        {loadingEvents ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events yet" description="Event analytics will appear here once events have been created." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-raised bg-raised/40">
                  {['Event', 'Category', 'Status', 'Registrations', 'Attended', 'Fill Rate', 'Avg Rating'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[1.5px] text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-raised hover:bg-raised/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-white truncate max-w-[200px]">{ev.title}</p>
                      <p className="text-xs text-muted">{ev.startDate ? format(parseISO(ev.startDate), 'MMM d, yyyy') : '—'}</p>
                    </td>
                    <td className="px-4 py-3"><Badge variant="default">{ev.category}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={eventStatusVariant(ev.status)}>{eventStatusLabel(ev.status)}</Badge></td>
                    <td className="px-4 py-3 text-sm text-secondary tabular-nums">{ev.currentRegistrations} / {ev.maxCapacity}</td>
                    <td className="px-4 py-3 text-sm text-secondary tabular-nums">{ev.attendedCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-raised rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${ev.fillRate}%`, background: ev.fillRate >= 90 ? '#FF3CAC' : '#AAFF00' }} />
                        </div>
                        <span className="text-xs text-secondary tabular-nums">{ev.fillRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ev.avgRating != null ? (
                        <span className="inline-flex items-center gap-1 text-sm text-yellow font-bold">
                          <Star className="w-3.5 h-3.5 fill-yellow text-yellow" />{ev.avgRating}
                        </span>
                      ) : <span className="text-sm text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
