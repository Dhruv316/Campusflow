import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import EventFilters from '../../components/events/EventFilters.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import { EventCardSkeleton } from '../../components/ui/Skeleton.jsx';
import PageError from '../../components/ui/PageError.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

import { getEvents } from '../../api/events.api.js';
import { registerForEvent, getMyRegistrations } from '../../api/registrations.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const StudentEvents = () => {
  const queryClient = useQueryClient();
  const [filters,       setFilters]       = useState({ search: '', category: '', dateFrom: '', dateTo: '' });
  const [currentPage,   setCurrentPage]   = useState(1);
  const [registeringId, setRegisteringId] = useState(null);

  const queryKey = ['events', { ...filters, page: currentPage, status: 'PUBLISHED' }];
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => getEvents({ page: currentPage, limit: 12, status: 'PUBLISHED', search: filters.search || undefined, category: filters.category || undefined, startDate: filters.dateFrom || undefined, endDate: filters.dateTo || undefined }),
    keepPreviousData: true,
  });

  const { data: myRegsData } = useQuery({ queryKey: ['my-registrations-all'], queryFn: () => getMyRegistrations({ limit: 200 }) });
  const myRegMap = Object.fromEntries((myRegsData?.data?.registrations ?? []).map((r) => [r.eventId, r]));

  const events     = data?.data?.events ?? [];
  const pagination = data?.pagination;

  const registerMutation = useMutation({
    mutationFn: registerForEvent,
    onSuccess: (res) => {
      const status = res?.data?.registration?.status;
      toast.success(status === 'WAITLISTED' ? "You've been added to the waitlist!" : 'Registration submitted!');
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations-all'] });
      queryClient.invalidateQueries({ queryKey: ['my-stats'] });
      setRegisteringId(null);
    },
    onError: (err) => { toast.error(getErrorMessage(err)); setRegisteringId(null); },
  });

  return (
    <div>
      <PageHeader title="Browse Events" subtitle="Discover and register for upcoming campus events" />
      <EventFilters filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} showStatus={false} />

      {isError ? (
        <PageError error={error} onRetry={refetch} title="Failed to load events" />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarDays} title={filters.search || filters.category ? 'No events match your filters' : 'No events available'} description={filters.search || filters.category ? 'Try adjusting your filters.' : 'There are no published events right now. Check back soon!'} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {events.map((event, idx) => {
              const myReg = myRegMap[event.id];
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={myReg ? undefined : () => { setRegisteringId(event.id); registerMutation.mutate({ eventId: event.id }); }}
                  myRegistration={myReg}
                  isRegistering={registeringId === event.id}
                />
              );
            })}
          </div>
          {pagination && pagination.totalPages > 1 && <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  );
};

export default StudentEvents;
