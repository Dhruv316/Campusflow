import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, CalendarDays } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import EventFilters from '../../components/events/EventFilters.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import { EventCardSkeleton } from '../../components/ui/Skeleton.jsx';
import PageError from '../../components/ui/PageError.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';

import { getEvents, deleteEvent, updateEventStatus } from '../../api/events.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const STATUS_OPTIONS = [
  { value: 'DRAFT',     label: 'Set to Draft'     },
  { value: 'PUBLISHED', label: 'Publish'           },
  { value: 'ONGOING',   label: 'Mark as Ongoing'  },
  { value: 'COMPLETED', label: 'Mark as Completed' },
  { value: 'CANCELLED', label: 'Cancel Event'      },
];

const AdminEvents = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [filters,      setFilters]      = useState({ search: '', category: '', status: '', dateFrom: '', dateTo: '' });
  const [currentPage,  setCurrentPage]  = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const queryKey = ['events', { ...filters, page: currentPage }];
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => getEvents({ page: currentPage, limit: 12, search: filters.search || undefined, category: filters.category || undefined, status: filters.status || undefined, startDate: filters.dateFrom || undefined, endDate: filters.dateTo || undefined }),
    keepPreviousData: true,
  });

  const events     = data?.data?.events ?? [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => { toast.success('Event deleted.'); queryClient.invalidateQueries({ queryKey: ['events'] }); setDeleteTarget(null); },
    onError: (err) => { toast.error(getErrorMessage(err)); setDeleteTarget(null); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateEventStatus(id, status),
    onSuccess: (_, { status }) => { toast.success(`Status → ${status}`); queryClient.invalidateQueries({ queryKey: ['events'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Create and manage all campus events"
        actions={[{ label: 'Create Event', icon: Plus, onClick: () => navigate('/admin/events/create') }]}
      />
      <EventFilters filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} />

      {isError ? (
        <PageError error={error} onRetry={refetch} title="Failed to load events" />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filters.search || filters.category || filters.status ? 'No events match your filters' : 'No events yet'}
          description={filters.search || filters.category || filters.status ? 'Try adjusting your filters.' : 'Create your first event to get started.'}
          action={!filters.search && !filters.category && !filters.status ? { label: 'Create Event', onClick: () => navigate('/admin/events/create') } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {events.map((event, idx) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  showAdminActions
                  onEdit={() => navigate(`/admin/events/${event.id}/edit`)}
                  onDelete={() => setDeleteTarget(event)}
                />
                <div className="absolute bottom-[80px] right-3">
                  <select
                    value={event.status}
                    onChange={(e) => { if (e.target.value !== event.status) statusMutation.mutate({ id: event.id, status: e.target.value }); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs rounded-lg px-2 py-1 bg-raised border border-border text-secondary hover:border-lime focus:outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} className="bg-black/50 backdrop-blur-sm">{opt.label}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Event"
        message={`Delete "${deleteTarget?.title}"? All registrations will also be deleted. This cannot be undone.`}
        confirmLabel="Delete Event"
      />
    </div>
  );
};

export default AdminEvents;
