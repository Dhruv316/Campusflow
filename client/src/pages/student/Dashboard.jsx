import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { CalendarDays, Ticket, Award, Search, ArrowRight, MapPin } from 'lucide-react';

import PageHeader from '../../components/layout/PageHeader.jsx';
import { StatCardSkeleton } from '../../components/ui/Skeleton.jsx';
import PageError from '../../components/ui/PageError.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge, { registrationStatusVariant, registrationStatusLabel } from '../../components/ui/Badge.jsx';

import { getMyStats } from '../../api/users.api.js';
import { getMyRegistrations } from '../../api/registrations.api.js';
import { getEvents } from '../../api/events.api.js';
import useAuth from '../../hooks/useAuth.js';

const StudentDashboard = () => {
  const { user } = useAuth();

  const { data: statsData, isLoading: loadingStats, isError: statsError, error: statsErr, refetch: refetchStats } = useQuery({ queryKey: ['my-stats'], queryFn: getMyStats });
  const { data: regsData, isLoading: loadingRegs } = useQuery({ queryKey: ['my-registrations', { limit: 5 }], queryFn: () => getMyRegistrations({ limit: 5 }) });
  const { data: eventsData, isLoading: loadingEvents } = useQuery({ queryKey: ['events', { status: 'PUBLISHED', limit: 6 }], queryFn: () => getEvents({ status: 'PUBLISHED', limit: 6 }) });

  const stats = statsData?.data ?? {};
  const upcomingRegs = (regsData?.data?.registrations ?? []).filter((r) => ['PENDING', 'APPROVED', 'WAITLISTED'].includes(r.status));
  const events = eventsData?.data?.events ?? [];

  const statDefs = [
    { title: 'Registered Events', value: stats.registeredCount   ?? 0, icon: Ticket,      color: 'purple' },
    { title: 'Events Attended',   value: stats.attendedCount     ?? 0, icon: CalendarDays, color: 'green'  },
    { title: 'Certificates',      value: stats.certificatesCount ?? 0, icon: Award,        color: 'amber'  },
  ];

  return (
    <div>
      {/* Welcome banner — neon marquee sign */}
      <div style={{ marginBottom:32, textAlign:'center' }}>
        {/* Date above */}
        <p style={{ fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase',color:'#8B6BA8',marginBottom:12 }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>

        {/* Neon marquee sign containing the name */}
        <div style={{ position:'relative',display:'inline-block',width:'min(65%, 700px)',margin:'0 auto' }}>
          {/* Star top-right */}
          <div style={{
            position:'absolute', top:-28, right:-28, zIndex:20,
            animation:'signGlow 2s ease-in-out infinite',
          }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 2 L34.5 29.5 L62 32 L34.5 34.5 L32 62 L29.5 34.5 L2 32 L29.5 29.5 Z" fill="#F5E642" style={{filter:'drop-shadow(0 0 8px #F5E642) drop-shadow(0 0 16px #F5E64288)'}}/>
            </svg>
          </div>
          {/* Star bottom-left */}
          <div style={{
            position:'absolute', bottom:-20, left:-20, zIndex:20,
            animation:'signGlow 2.5s ease-in-out infinite 0.6s',
          }}>
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 2 L34.5 29.5 L62 32 L34.5 34.5 L32 62 L29.5 34.5 L2 32 L29.5 29.5 Z" fill="#F5E642" style={{filter:'drop-shadow(0 0 8px #F5E642) drop-shadow(0 0 14px #F5E64288)'}}/>
            </svg>
          </div>

          {/* The sign itself */}
          <div style={{
            position:'relative',
            background:'linear-gradient(135deg, #1a0008, #2a0010, #1a0008)',
            border:'3px solid #FF3CAC',
            borderRadius:'16px 48px 16px 48px',
            padding:'28px 40px',
            boxShadow:'0 0 20px #FF3CAC88, 0 0 40px #FF3CAC44, inset 0 0 30px rgba(255,60,172,0.08)',
            overflow:'hidden',
          }}>
            {/* Dashed inner ring */}
            <div style={{
              position:'absolute', inset:6,
              border:'1px dashed rgba(255,60,172,0.35)',
              borderRadius:'12px 44px 12px 44px',
              pointerEvents:'none',
            }}/>
            {/* Dotted lights along border */}
            <div style={{
              position:'absolute', inset:-1,
              borderRadius:'16px 48px 16px 48px',
              backgroundImage:'radial-gradient(circle, #FF3CAC 1.5px, transparent 1.5px)',
              backgroundSize:'14px 14px',
              opacity:0.5,
              pointerEvents:'none',
              animation:'lightsScroll 1s linear infinite',
            }}/>
            {/* Name */}
            <h1 style={{
              fontFamily:"'Bebas Neue'",
              fontSize:'clamp(48px, 7vw, 88px)',
              letterSpacing:6,
              color:'white',
              margin:0,
              lineHeight:1,
              position:'relative',
              zIndex:1,
              WebkitTextStroke:'3px #6b0044',
              textShadow:'3px 3px 0 #6b0044, 6px 6px 0 rgba(0,0,0,0.4), 0 0 30px #FF3CAC88',
            }}>
              {user?.name?.toUpperCase()}
            </h1>
          </div>
        </div>

        {/* Below the sign */}
        <p className="text-led-green" style={{ fontSize:13, marginTop:20, marginBottom:4, letterSpacing:5 }}>WELCOME BACK,</p>
        <p style={{ color:'#8B6BA8', fontSize:13, marginBottom:20 }}>Ready to discover what's happening on campus?</p>
        <Link to="/dashboard/events"
          className="btn-vegas btn-vegas-lime"
          style={{ fontSize:14, padding:'12px 32px', letterSpacing:3, display:'inline-flex', alignItems:'center', gap:8 }}>
          <Search size={15}/> BROWSE EVENTS
        </Link>
      </div>

      {/* Stats */}
      {statsError ? (
        <PageError error={statsErr} onRetry={refetchStats} title="Failed to load your stats" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {loadingStats ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />) : statDefs.map((s) => <StatCard key={s.title} {...s} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming */}
        <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-raised flex items-center justify-between">
            <h2 className="text-display text-xl text-white tracking-[2px]">MY UPCOMING</h2>
            <Link to="/dashboard/registrations" className="text-xs text-lime hover:text-lime/80 font-bold uppercase tracking-[0.5px] flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loadingRegs ? <div className="flex justify-center py-10"><Spinner /></div>
            : upcomingRegs.length === 0 ? <EmptyState icon={Ticket} title="No upcoming events" description="Register for events to see them here." />
            : (
              <ul className="divide-y divide-raised">
                {upcomingRegs.map((reg) => (
                  <li key={reg.id} className="flex items-center gap-3 px-5 py-3 hover:bg-raised/40 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{reg.event?.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                        <MapPin className="w-3 h-3 text-lime/60" />
                        <span className="truncate">{reg.event?.venue ?? '—'}</span>
                        {reg.event?.startDate && <span className="shrink-0">· {format(parseISO(reg.event.startDate), 'MMM d')}</span>}
                      </div>
                    </div>
                    <Badge variant={registrationStatusVariant(reg.status)}>{registrationStatusLabel(reg.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
        </div>

        {/* Discover */}
        <div className="bg-black/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-raised flex items-center justify-between">
            <h2 className="text-display text-xl text-white tracking-[2px]">DISCOVER EVENTS</h2>
            <Link to="/dashboard/events" className="text-xs text-lime hover:text-lime/80 font-bold uppercase tracking-[0.5px] flex items-center gap-1">See all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loadingEvents ? <div className="flex justify-center py-10"><Spinner /></div>
            : events.length === 0 ? <EmptyState icon={CalendarDays} title="No events published yet" description="Check back soon for upcoming campus events." />
            : (
              <ul className="divide-y divide-raised">
                {events.slice(0, 5).map((event) => (
                  <li key={event.id} className="px-5 py-3 hover:bg-raised/40 transition-colors">
                    <Link to={`/dashboard/events/${event.id}`} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                        <p className="text-xs text-muted mt-0.5">{event.startDate ? format(parseISO(event.startDate), 'MMM d, yyyy') : '—'} · {event.currentRegistrations}/{event.maxCapacity} registered</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
