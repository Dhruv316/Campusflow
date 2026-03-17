import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import Avatar from '../ui/Avatar.jsx';
import { getMyNotifications } from '../../api/notifications.api.js';

const UNREAD_QUERY_PARAMS = { unreadOnly: 'true', limit: 1 };

const TopBar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [bellRinging, setBellRinging] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['my-notifications', UNREAD_QUERY_PARAMS],
    queryFn:  () => getMyNotifications(UNREAD_QUERY_PARAMS),
    refetchInterval: 60_000,
    enabled: Boolean(user),
  });
  const unreadCount = notifData?.data?.unreadCount ?? 0;

  useEffect(() => {
    if (unreadCount > 0) {
      setBellRinging(true);
      const t = setTimeout(() => setBellRinging(false), 1000);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);
  const badgeLabel  = unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;
  const notificationsHref = user?.role === 'ADMIN' ? '/admin/notifications' : '/dashboard/notifications';
  const profileHref       = user?.role === 'ADMIN' ? '/admin/users' : '/dashboard/profile';

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-black/70 backdrop-blur-md border-b border-raised flex items-center px-4 gap-3 shrink-0 sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-muted hover:text-lime hover:bg-surface transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="font-display text-3xl text-white tracking-[2px] flex-1 truncate">
        {title}
      </h1>

      <div className="flex items-center gap-1">
        {/* Bell */}
        <button
          onClick={() => navigate(notificationsHref)}
          className="relative p-2 rounded-lg text-muted hover:text-lime hover:bg-surface transition-colors"
          aria-label="Notifications"
        >
          <Bell
            style={{ width: 18, height: 18 }}
            className={unreadCount > 0 ? 'text-lime animate-glow-pulse' : ''}
          />
          {badgeLabel && (
            <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-pink text-white text-[9px] font-bold ring-2 ring-base">
              {badgeLabel}
            </span>
          )}
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center p-1 rounded-lg hover:bg-surface transition-colors"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-[0_8px_32px_#00000088] py-1 animate-fade-in z-30">
              <div className="px-4 py-3 border-b border-raised">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>

              <Link
                to={profileHref}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:text-lime hover:bg-raised transition-colors"
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>

              <Link
                to={notificationsHref}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:text-lime hover:bg-raised transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
                {badgeLabel && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pink text-white text-[10px] font-bold">
                    {badgeLabel}
                  </span>
                )}
              </Link>

              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted hover:text-pink hover:bg-raised transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
