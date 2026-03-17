import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ClipboardList, CheckCheck, X as XIcon } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import SearchBar from '../../components/ui/SearchBar.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';
import RegistrationRow from '../../components/registrations/RegistrationRow.jsx';

import { getEvents } from '../../api/events.api.js';
import { getRegistrationsByEvent, updateRegistrationStatus, checkIn } from '../../api/registrations.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const STATUS_TABS = [
  { key: '', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'APPROVED', label: 'Approved' },
  { key: 'WAITLISTED', label: 'Waitlisted' }, { key: 'ATTENDED', label: 'Attended' }, { key: 'REJECTED', label: 'Rejected' },
];

const AdminRegistrations = () => {
  const queryClient  = useQueryClient();
  const [eventId,     setEventId]     = useState('');
  const [search,      setSearch]      = useState('');
  const [statusTab,   setStatusTab]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: eventsData } = useQuery({ queryKey: ['events-all'], queryFn: () => getEvents({ limit: 100 }) });
  const eventOptions = eventsData?.data?.events ?? [];

  const regQueryKey = ['registrations', eventId, statusTab, search, currentPage];
  const { data, isLoading, isError, error } = useQuery({
    queryKey: regQueryKey,
    queryFn:  () => getRegistrationsByEvent(eventId, { status: statusTab || undefined, search: search || undefined, page: currentPage, limit: 20 }),
    enabled:  Boolean(eventId),
  });
  const registrations = data?.data?.registrations ?? [];
  const pagination    = data?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateRegistrationStatus(id, status),
    onSuccess: (res, { status }) => { const fs = res?.data?.registration?.status ?? status; toast.success(`Registration ${fs.toLowerCase()}.`); queryClient.invalidateQueries({ queryKey: ['registrations'] }); setSelectedIds(new Set()); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const checkinMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: (res) => { toast.success(`${res?.data?.registration?.student?.name ?? 'Student'} checked in!`); queryClient.invalidateQueries({ queryKey: ['registrations'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleBulkAction = async (status) => {
    const ids = [...selectedIds];
    await Promise.allSettled(ids.map((id) => statusMutation.mutateAsync({ id, status })));
    setSelectedIds(new Set());
  };
  const toggleSelect    = (id, checked) => setSelectedIds((prev) => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });
  const toggleSelectAll = (checked) => setSelectedIds(checked ? new Set(registrations.map((r) => r.id)) : new Set());

  return (
    <div>
      <PageHeader title="Registrations" subtitle="Manage all event registrations" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={eventId}
          onChange={(e) => { setEventId(e.target.value); setCurrentPage(1); setSelectedIds(new Set()); }}
          className="text-sm rounded-lg px-3 py-2.5 bg-black/50 backdrop-blur-sm border border-border text-white focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 min-w-[220px] transition-all"
        >
          <option value="" className="bg-black/50 backdrop-blur-sm">Select an event…</option>
          {eventOptions.map((ev) => <option key={ev.id} value={ev.id} className="bg-black/50 backdrop-blur-sm">{ev.title}</option>)}
        </select>
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search by student name…" className="w-full sm:w-64" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 bg-black/50 backdrop-blur-sm border border-raised rounded-xl p-1 w-fit overflow-x-auto">
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => { setStatusTab(key); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-[0.5px] transition-all duration-150 whitespace-nowrap ${
              statusTab === key ? 'bg-lime text-ink' : 'text-muted hover:text-lime hover:bg-raised'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-lime/10 border border-lime/30 rounded-xl">
          <span className="text-sm font-bold text-lime">{selectedIds.size} selected</span>
          <Button variant="secondary" size="sm" onClick={() => handleBulkAction('APPROVED')}><CheckCheck className="w-3.5 h-3.5" />Approve All</Button>
          <Button variant="danger" size="sm" onClick={() => handleBulkAction('REJECTED')}><XIcon className="w-3.5 h-3.5" />Reject All</Button>
        </div>
      )}

      {!eventId ? (
        <EmptyState icon={ClipboardList} title="Select an event" description="Choose an event from the dropdown above to view its registrations." />
      ) : isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="bg-pink/10 border border-pink/30 rounded-xl p-6 text-center"><p className="text-sm text-pink">{getErrorMessage(error)}</p></div>
      ) : registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No registrations found" description={search || statusTab ? 'Try adjusting your filters.' : 'No students registered yet.'} />
      ) : (
        <>
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-raised bg-raised/40">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" onChange={(e) => toggleSelectAll(e.target.checked)} checked={selectedIds.size === registrations.length && registrations.length > 0} className="w-4 h-4 rounded border-border bg-ink accent-lime" />
                    </th>
                    {['Student', 'Event', 'Status', 'Registered', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[1.5px] text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <RegistrationRow key={reg.id} registration={reg} selected={selectedIds.has(reg.id)} onSelect={(checked) => toggleSelect(reg.id, checked)}
                      onApprove={() => statusMutation.mutate({ id: reg.id, status: 'APPROVED' })}
                      onReject={() => statusMutation.mutate({ id: reg.id, status: 'REJECTED' })}
                      onCheckin={() => checkinMutation.mutate(reg.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {pagination && pagination.totalPages > 1 && <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  );
};

export default AdminRegistrations;
