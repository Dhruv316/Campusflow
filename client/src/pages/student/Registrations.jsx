import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Ticket, QrCode, X as XIcon, Calendar, MapPin, Star } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge, { registrationStatusVariant, registrationStatusLabel } from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import QRTicket from './QRTicket.jsx';

import { getMyRegistrations, cancelRegistration, submitFeedback } from '../../api/registrations.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const STATUS_TABS = [
  { key: '', label: 'All' }, { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'ATTENDED', label: 'Attended' }, { key: 'REJECTED', label: 'Cancelled' },
];

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <Star className={`w-5 h-5 transition-colors ${s <= value ? 'fill-yellow text-yellow' : 'text-muted'}`} />
      </button>
    ))}
  </div>
);

const StudentRegistrations = () => {
  const queryClient = useQueryClient();
  const [activeTab,      setActiveTab]      = useState('');
  const [qrTarget,       setQrTarget]       = useState(null);
  const [cancelTarget,   setCancelTarget]   = useState(null);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackText,   setFeedbackText]   = useState('');
  const [rating,         setRating]         = useState(0);

  const statusParam  = activeTab === 'UPCOMING' ? undefined : activeTab || undefined;
  const upcomingFilter = activeTab === 'UPCOMING';

  const { data, isLoading } = useQuery({
    queryKey: ['my-registrations', { status: statusParam }],
    queryFn:  () => getMyRegistrations({ status: statusParam, limit: 50 }),
  });

  let registrations = data?.data?.registrations ?? [];
  if (upcomingFilter) registrations = registrations.filter((r) => ['PENDING', 'APPROVED', 'WAITLISTED'].includes(r.status));

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelRegistration(id),
    onSuccess: () => { toast.success('Registration cancelled.'); queryClient.invalidateQueries({ queryKey: ['my-registrations'] }); queryClient.invalidateQueries({ queryKey: ['my-stats'] }); setCancelTarget(null); },
    onError: (err) => { toast.error(getErrorMessage(err)); setCancelTarget(null); },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id }) => submitFeedback(id, { rating, feedback: feedbackText }),
    onSuccess: () => { toast.success('Feedback submitted!'); queryClient.invalidateQueries({ queryKey: ['my-registrations'] }); setFeedbackTarget(null); setFeedbackText(''); setRating(0); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const canFeedback = (reg) => reg.status === 'ATTENDED' && reg.event?.status === 'COMPLETED' && !reg.feedback && !reg.rating;

  return (
    <div>
      <PageHeader title="My Registrations" subtitle="All your event registrations in one place" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-black/50 backdrop-blur-sm border border-raised rounded-xl p-1 w-fit overflow-x-auto">
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-[0.5px] transition-all duration-150 whitespace-nowrap ${
              activeTab === key ? 'bg-lime text-ink' : 'text-muted hover:text-lime hover:bg-raised'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : registrations.length === 0 ? (
        <EmptyState icon={Ticket} title="No registrations found" description={activeTab ? 'No registrations match this filter.' : 'Register for events to see them here.'} action={!activeTab ? { label: 'Browse Events', onClick: () => window.location.href = '/dashboard/events' } : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-lime transition-all duration-200">
              {/* Status strip */}
              <div className="h-1 w-full" style={{
                background: ['APPROVED','ATTENDED'].includes(reg.status) ? '#AAFF00' :
                  reg.status === 'REJECTED' ? '#FF3CAC' : reg.status === 'PENDING' ? '#F5E642' : '#4A1080'
              }} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-white line-clamp-2">{reg.event?.title}</h3>
                  <Badge variant={registrationStatusVariant(reg.status)} className="shrink-0">{registrationStatusLabel(reg.status)}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-muted mb-4">
                  {reg.event?.startDate && (
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-lime/60" />{format(parseISO(reg.event.startDate), 'MMM d, yyyy · h:mm a')}</span>
                  )}
                  {reg.event?.venue && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-lime/60" /><span className="truncate">{reg.event.venue}</span></span>
                  )}
                </div>

                {reg.rating && (
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= reg.rating ? 'fill-yellow text-yellow' : 'text-muted'}`} />)}
                  </div>
                )}

                {/* Inline feedback form */}
                {feedbackTarget === reg.id ? (
                  <div className="space-y-3 mb-3 p-3 bg-yellow/10 rounded-xl border border-yellow/30">
                    <StarRating value={rating} onChange={setRating} />
                    <textarea rows={3} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Share your experience…"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 backdrop-blur-sm border border-border text-white placeholder:text-muted resize-none focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all" />
                    <div className="flex gap-2">
                      <button onClick={() => { setFeedbackTarget(null); setRating(0); setFeedbackText(''); }} className="text-xs text-muted hover:text-white transition-colors">Cancel</button>
                      <Button size="sm" variant="primary" isLoading={feedbackMutation.isPending} disabled={rating === 0} onClick={() => feedbackMutation.mutate({ id: reg.id })} className="flex-1">Submit</Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  {reg.status === 'APPROVED' && (
                    <button onClick={() => setQrTarget(reg)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase border border-cyan/60 text-cyan hover:bg-cyan hover:text-ink rounded-full transition-all">
                      <QrCode className="w-3.5 h-3.5" /> QR Ticket
                    </button>
                  )}
                  {['PENDING', 'WAITLISTED'].includes(reg.status) && (
                    <button onClick={() => setCancelTarget(reg)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase border border-pink/60 text-pink hover:bg-pink hover:text-white rounded-full transition-all">
                      <XIcon className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  {canFeedback(reg) && feedbackTarget !== reg.id && (
                    <button onClick={() => { setFeedbackTarget(reg.id); setRating(0); setFeedbackText(''); }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase border border-yellow/60 text-yellow hover:bg-yellow hover:text-ink rounded-full transition-all">
                      <Star className="w-3.5 h-3.5" /> Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QRTicket isOpen={!!qrTarget} onClose={() => setQrTarget(null)} registration={qrTarget} />
      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={() => cancelMutation.mutate(cancelTarget?.id)} isLoading={cancelMutation.isPending} title="Cancel Registration" message={`Cancel your registration for "${cancelTarget?.event?.title}"?`} confirmLabel="Yes, Cancel" />
    </div>
  );
};

export default StudentRegistrations;
