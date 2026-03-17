import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  Calendar, MapPin, Users, Clock, Tag, ArrowLeft,
  Share2, Star, QrCode, X as XIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Badge, { eventStatusVariant, eventStatusLabel, registrationStatusVariant, registrationStatusLabel } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import QRTicket from './QRTicket.jsx';

import { getEventById } from '../../api/events.api.js';
import { registerForEvent, cancelRegistration, submitFeedback } from '../../api/registrations.api.js';
import { getErrorMessage } from '../../utils/helpers.js';

const formatDt = (d) => d ? format(typeof d === 'string' ? parseISO(d) : d, 'EEEE, MMMM d, yyyy · h:mm a') : '—';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
        <Star className={`w-6 h-6 transition-colors ${star <= value ? 'text-yellow fill-yellow' : 'text-muted'}`} />
      </button>
    ))}
  </div>
);

const EventDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [showQR,       setShowQR]       = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating,       setRating]       = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // Team event fields inside registration modal
  const [teamName,    setTeamName]    = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [teamNameErr, setTeamNameErr] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn:  () => getEventById(id),
    enabled:  Boolean(id),
  });

  const event          = data?.data?.event ?? null;
  const myRegistration = data?.data?.myRegistration ?? null;

  // ── Register mutation ──────────────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (payload) => registerForEvent(payload),
    onSuccess: (res) => {
      const status = res?.data?.registration?.status;
      toast.success(status === 'WAITLISTED' ? "You've been added to the waitlist!" : 'Registration submitted! Awaiting approval.');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['my-stats'] });
      setShowRegModal(false);
      setTeamName('');
      setTeamMembers('');
      setTeamNameErr('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleConfirmRegister = () => {
    if (event?.isTeamEvent) {
      if (!teamName.trim()) { setTeamNameErr('Team name is required'); return; }
      setTeamNameErr('');
      registerMutation.mutate({
        eventId: id,
        teamName: teamName.trim(),
        teamMembers: teamMembers.split(',').map((s) => s.trim()).filter(Boolean),
      });
    } else {
      registerMutation.mutate({ eventId: id });
    }
  };

  // ── Cancel mutation ────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: () => cancelRegistration(myRegistration.id),
    onSuccess: () => {
      toast.success('Registration cancelled.');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['my-stats'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Feedback mutation ──────────────────────────────────────────────────────
  const feedbackMutation = useMutation({
    mutationFn: () => submitFeedback(myRegistration.id, { rating, feedback: feedbackText }),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      setShowFeedback(false);
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (!event) return (
    <div className="text-center py-24">
      <p className="text-muted mb-4">Event not found.</p>
      <Link to="/dashboard/events" className="text-lime font-bold hover:underline">← Back to events</Link>
    </div>
  );

  const capacityPct = event.maxCapacity > 0 ? Math.min(Math.round((event.currentRegistrations / event.maxCapacity) * 100), 100) : 0;
  const canCancel    = myRegistration && ['PENDING', 'WAITLISTED'].includes(myRegistration.status);
  const canFeedback  = myRegistration?.status === 'ATTENDED' && event.status === 'COMPLETED' && !myRegistration.feedback && !myRegistration.rating;

  return (
    <div>
      <div className="mb-4">
        <Link to="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-lime transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to events
        </Link>
      </div>

      {/* Banner */}
      <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden mb-6 border border-border"
        style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #4A1080 100%)' }}>
        {event.bannerImage && <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-display text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}>{event.title.toUpperCase()}</h1>
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="default">{event.category}</Badge>
          <Badge variant={eventStatusVariant(event.status)}>{eventStatusLabel(event.status)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-5">
            <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Info grid */}
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: 'Start', value: formatDt(event.startDate) },
              { icon: Clock,    label: 'End',   value: formatDt(event.endDate)   },
              { icon: MapPin,   label: 'Venue', value: event.venue               },
              { icon: Users,    label: 'Capacity', value: `${event.currentRegistrations} / ${event.maxCapacity}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-lime" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-muted shrink-0" />
              {event.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-raised border border-border text-secondary text-xs font-bold uppercase">{tag}</span>
              ))}
            </div>
          )}

          {/* Team info */}
          {event.isTeamEvent && (
            <div className="p-4 bg-yellow/10 rounded-xl border border-yellow/30">
              <p className="text-sm font-bold text-yellow mb-1">⚡ Team Event</p>
              <p className="text-sm text-yellow/80">{event.teamMinSize}–{event.teamMaxSize} members per team required</p>
            </div>
          )}

          {/* Feedback */}
          {canFeedback && (
            <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-display text-xl text-white tracking-[2px]">RATE THIS EVENT</h3>
                {!showFeedback && <Button size="sm" variant="secondary" onClick={() => setShowFeedback(true)}>Give Feedback</Button>}
              </div>
              {showFeedback && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary mb-2">Your rating</p>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <textarea rows={4} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Share your experience…"
                    className="w-full px-4 py-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-border text-white placeholder:text-muted text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 resize-y transition-all" />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setShowFeedback(false); setRating(0); setFeedbackText(''); }}>Cancel</Button>
                    <Button variant="primary" size="sm" isLoading={feedbackMutation.isPending} disabled={rating === 0} onClick={() => feedbackMutation.mutate()}>Submit Feedback</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submitted feedback */}
          {myRegistration?.feedback && (
            <div className="p-4 bg-yellow/10 rounded-xl border border-yellow/30">
              <p className="text-sm font-bold text-yellow mb-2 flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow" />Your Feedback Submitted</p>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= (myRegistration.rating ?? 0) ? 'fill-yellow text-yellow' : 'text-muted'}`} />)}
              </div>
              {myRegistration.feedback && <p className="text-sm text-yellow/80">{myRegistration.feedback}</p>}
            </div>
          )}
        </div>

        {/* Right — registration card */}
        <div className="lg:col-span-1">
          <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl p-5 sticky top-20">
            <h3 className="text-display text-xl text-white tracking-[2px] mb-4">REGISTRATION</h3>

            {event.maxCapacity > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>{event.currentRegistrations} registered</span>
                  <span className="text-lime font-bold">{event.maxCapacity - event.currentRegistrations} spots left</span>
                </div>
                <div className="h-2 bg-raised rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${capacityPct}%`, background: capacityPct >= 90 ? '#FF3CAC' : '#AAFF00' }} />
                </div>
              </div>
            )}

            {!myRegistration ? (
              <Button
                variant="primary"
                className="w-full mb-4"
                disabled={event.status !== 'PUBLISHED' || new Date() > new Date(event.registrationDeadline)}
                onClick={() => setShowRegModal(true)}
              >
                {new Date() > new Date(event.registrationDeadline) ? 'Registration Closed' : event.currentRegistrations >= event.maxCapacity ? 'Join Waitlist' : 'Register Now'}
              </Button>
            ) : (
              <div className="mb-4 space-y-3">
                <div className={`p-3 rounded-xl border text-center ${
                  myRegistration.status === 'APPROVED' ? 'bg-cyan/10 border-cyan/30' :
                  myRegistration.status === 'ATTENDED' ? 'bg-lime/10 border-lime/30' :
                  myRegistration.status === 'REJECTED' ? 'bg-pink/10 border-pink/30' :
                  'bg-yellow/10 border-yellow/30'
                }`}>
                  <Badge variant={registrationStatusVariant(myRegistration.status)}>{registrationStatusLabel(myRegistration.status)}</Badge>
                  <p className="text-xs text-muted mt-1.5">
                    {myRegistration.status === 'PENDING'    && 'Awaiting admin approval'}
                    {myRegistration.status === 'WAITLISTED' && "You're on the waitlist"}
                    {myRegistration.status === 'APPROVED'   && "You're confirmed — see you there!"}
                    {myRegistration.status === 'ATTENDED'   && 'You attended this event'}
                    {myRegistration.status === 'REJECTED'   && 'Contact admin for more info'}
                  </p>
                </div>
                {myRegistration.status === 'APPROVED' && (
                  <Button variant="cyan" size="sm" className="w-full" onClick={() => setShowQR(true)}>
                    <QrCode className="w-4 h-4" /> View QR Ticket
                  </Button>
                )}
                {canCancel && (
                  <Button variant="ghost" size="sm" className="w-full text-pink hover:text-pink hover:bg-pink/10 border-pink/30" isLoading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
                    <XIcon className="w-4 h-4" /> Cancel Registration
                  </Button>
                )}
              </div>
            )}

            <div className="text-xs text-muted space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">Registration deadline:</p>
              <p>{formatDt(event.registrationDeadline)}</p>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-muted hover:text-lime transition-colors"
              onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Link copied!'))}>
              <Share2 className="w-3.5 h-3.5" /> Share Event
            </button>
          </div>
        </div>
      </div>

      {/* ── Registration Modal (with team fields) ── */}
      <Modal isOpen={showRegModal} onClose={() => { setShowRegModal(false); setTeamName(''); setTeamMembers(''); setTeamNameErr(''); }} title={`REGISTER FOR EVENT`} size="sm">
        <div className="p-6 space-y-5">
          <p className="text-secondary text-sm leading-relaxed">
            {event.isTeamEvent ? 'This is a team event. Please provide your team details.' : `Confirm your registration for "${event.title}"?`}
          </p>

          {event.isTeamEvent && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">Team Name <span className="text-lime">*</span></label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => { setTeamName(e.target.value); setTeamNameErr(''); }}
                  placeholder="Enter your team name"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-border text-white placeholder:text-muted text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
                />
                {teamNameErr && <p className="text-xs text-pink font-medium">{teamNameErr}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary">Team Members</label>
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="Member emails, comma separated"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-border text-white placeholder:text-muted text-sm focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
                />
                <p className="text-xs text-muted">Enter team member emails separated by commas</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => { setShowRegModal(false); setTeamName(''); setTeamMembers(''); setTeamNameErr(''); }}>Cancel</Button>
            <Button variant="primary" isLoading={registerMutation.isPending} onClick={handleConfirmRegister}>Confirm Registration</Button>
          </div>
        </div>
      </Modal>

      {/* QR Ticket modal */}
      <QRTicket isOpen={showQR} onClose={() => setShowQR(false)} registration={myRegistration ? { ...myRegistration, event } : null} />
    </div>
  );
};

export default EventDetail;
