import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Zap, Home, CalendarDays, ClipboardList, Award, Bell, User, LogOut, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import Avatar from '../ui/Avatar.jsx';
import { getMyNotifications } from '../../api/notifications.api.js';

const NAV_ITEMS = [
  { label: 'Home',             href: '/dashboard',               icon: Home,          end: true  },
  { label: 'Browse Events',    href: '/dashboard/events',        icon: CalendarDays,  end: false },
  { label: 'My Registrations', href: '/dashboard/registrations', icon: ClipboardList, end: false },
  { label: 'My Certificates',  href: '/dashboard/certificates',  icon: Award,         end: false },
  { label: 'Notifications',    href: '/dashboard/notifications', icon: Bell,          end: false },
  { label: 'Profile',          href: '/dashboard/profile',       icon: User,          end: false },
];

const UNREAD_QUERY_PARAMS = { unreadOnly: 'true', limit: 1 };

const StudentSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    if (!isMobile && isOpen) onClose();
  }, [isMobile, isOpen, onClose]);

  const { data: notifData } = useQuery({
    queryKey: ['my-notifications', UNREAD_QUERY_PARAMS],
    queryFn:  () => getMyNotifications(UNREAD_QUERY_PARAMS),
    refetchInterval: 60_000,
    enabled: Boolean(user),
  });
  const unreadCount = notifData?.data?.unreadCount ?? 0;
  const badgeLabel  = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;

  const content = (
    <div className="flex flex-col h-full grain-bg bg-black/80 backdrop-blur-md border-r border-raised">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-raised">
        <Zap className="w-6 h-6 text-neon-lime fill-lime shrink-0" />
        <span className="text-display text-2xl text-neon-lime tracking-[3px] cf-logo" style={{ cursor: "default", transition: "text-shadow 0.2s" }} onMouseEnter={e => e.target.style.textShadow = "-2px 0 #FF3CAC, 2px 0 #00E5FF"} onMouseLeave={e => e.target.style.textShadow = ""}>CAMPUSFLOW</span>
        <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-muted hover:text-neon-lime hover:bg-surface transition-colors lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ` +
              (isActive
                ? 'bg-surface text-neon-lime border-l-[3px] border-lime pl-[calc(1rem-3px)]'
                : 'text-muted hover:bg-surface hover:text-neon-lime hover:border-l-[3px] hover:border-lime hover:pl-[calc(1rem-3px)]')
            }
          >
            {({ isActive }) => (
              <>
                <Icon style={{ width: 18, height: 18 }} className={isActive ? 'text-neon-lime' : ''} />
                <span className="flex-1">{label}</span>
                {label === 'Notifications' && badgeLabel && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-white text-[10px] font-bold">
                    {badgeLabel}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-raised">
        <div className="flex items-center gap-3 p-3 bg-surface border border-raised rounded-xl">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <span className="inline-block px-2 py-0.5 rounded-full bg-lime/10 border border-lime/40 text-neon-lime text-[10px] font-bold uppercase tracking-[1px]">Student</span>
          </div>
          <button onClick={logout} title="Sign out" className="p-1.5 rounded-lg text-muted hover:text-pink hover:bg-pink/10 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0">{content}</aside>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">{content}</aside>
        </div>
      )}
    </>
  );
};

export default StudentSidebar;
