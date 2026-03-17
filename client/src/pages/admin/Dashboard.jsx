import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, Users, TrendingUp, CalendarClock, ArrowRight } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import { StatCardSkeleton, EventCardSkeleton } from '../../components/ui/Skeleton.jsx';
import PageError from '../../components/ui/PageError.jsx';
import Badge, { registrationStatusVariant, registrationStatusLabel, eventStatusVariant, eventStatusLabel } from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

import { getOverview } from '../../api/analytics.api.js';
import { getEvents } from '../../api/events.api.js';
import { getRegistrationsByEvent } from '../../api/registrations.api.js';

const RecentRegistrationsPanel = ({ events }) => {
  const firstEventId = events?.[0]?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['registrations', firstEventId],
    queryFn:  () => getRegistrationsByEvent(firstEventId, { limit: 5 }),
    enabled:  Boolean(firstEventId),
  });
  const registrations = data?.data?.registrations ?? [];

  return (
    <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-raised flex items-center justify-between">
        <h2 className="text-display text-xl text-white tracking-[2px]">RECENT REGISTRATIONS</h2>
        <Link to="/admin/registrations" className="text-xs text-lime hover:text-lime/80 font-bold uppercase tracking-[0.5px] flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No registrations yet" description="Registrations will appear here once students sign up." />
      ) : (
        <ul className="divide-y divide-raised">
          {registrations.map((reg) => (
            <li key={reg.id} className="flex items-center gap-3 px-5 py-3 hover:bg-raised/50 transition-colors">
              <Avatar name={reg.student?.name} src={reg.student?.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{reg.student?.name}</p>
                <p className="text-xs text-muted truncate">{reg.event?.title}</p>
              </div>
              <Badge variant={registrationStatusVariant(reg.status)}>{registrationStatusLabel(reg.status)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { data: overviewData, isLoading: loadingOverview, isError: overviewError, error: overviewErr, refetch: refetchOverview } = useQuery({ queryKey: ['analytics-overview'], queryFn: getOverview });
  const { data: eventsData, isLoading: loadingEvents, isError: eventsError, error: eventsErr, refetch: refetchEvents } = useQuery({
    queryKey: ['events', { limit: 5, status: 'PUBLISHED' }],
    queryFn:  () => getEvents({ limit: 5, status: 'PUBLISHED' }),
  });

  const overview = overviewData?.data ?? {};
  const events   = eventsData?.data?.events ?? [];

  const statDefs = [
    { title: 'Total Events',        value: overview.totalEvents ?? 0,        icon: CalendarDays,  color: 'purple', trend: overview.publishedEvents != null ? { value: `${overview.publishedEvents} published`, isPositive: true } : undefined },
    { title: 'Total Registrations', value: overview.totalRegistrations ?? 0,  icon: ClipboardList, color: 'blue'   },
    { title: 'Active Students',     value: overview.totalStudents ?? 0,       icon: Users,         color: 'green'  },
    { title: 'Upcoming Events',     value: overview.upcomingEvents ?? 0,      icon: TrendingUp,    color: 'amber'  },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')}`} />

      {overviewError ? (
        <PageError error={overviewErr} onRetry={refetchOverview} title="Failed to load overview stats" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {loadingOverview
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statDefs.map((s) => <StatCard key={s.title} {...s} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentRegistrationsPanel events={events} />

        <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-raised flex items-center justify-between">
            <h2 className="text-display text-xl text-white tracking-[2px]">UPCOMING EVENTS</h2>
            <Link to="/admin/events" className="text-xs text-lime hover:text-lime/80 font-bold uppercase tracking-[0.5px] flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {eventsError ? (
            <PageError error={eventsErr} onRetry={refetchEvents} />
          ) : loadingEvents ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton-shimmer h-4 flex-1 rounded" />
                  <div className="skeleton-shimmer h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No upcoming events" description="Create and publish events to see them here." />
          ) : (
            <ul className="divide-y divide-raised">
              {events.map((event) => (
                <li key={event.id} className="flex items-center gap-3 px-5 py-3 hover:bg-raised/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                    <p className="text-xs text-muted">{format(parseISO(event.startDate), 'MMM d, yyyy')} · {event.venue}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted">{event.currentRegistrations}/{event.maxCapacity}</span>
                    <Badge variant={eventStatusVariant(event.status)}>{eventStatusLabel(event.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
