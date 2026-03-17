import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar.jsx';
import TopBar from './TopBar.jsx';
import Particles from '../ui/Particles.jsx';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (s) => UUID_PATTERN.test(s);

const getTitleFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const lastRaw = segments[segments.length - 1];
  if (isUUID(lastRaw)) return 'Event Details';
  const meaningful = segments.filter((s) => !isUUID(s));
  const last = meaningful[meaningful.length - 1];
  const map = {
    dashboard: 'Home', events: 'Browse Events',
    registrations: 'My Registrations', certificates: 'My Certificates',
    notifications: 'Notifications', profile: 'My Profile',
  };
  return map[last] ?? (last ? last.charAt(0).toUpperCase() + last.slice(1) : 'Home');
};

const getBgFromPath = (pathname) => {
  if (pathname.includes('registrations')) return '/images/bg2.jpg';
  if (pathname.includes('certificates') || pathname.includes('profile')) return '/images/bg3.jpg';
  if (pathname.includes('notifications')) return '/images/bg4.jpg';
  return '/images/bg5.jpg';
};

const getGlowFromPath = (pathname) => {
  if (pathname.includes('registrations'))
    return 'radial-gradient(ellipse at 20% 50%, rgba(0,229,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(170,255,0,0.10) 0%, transparent 50%)';
  if (pathname.includes('certificates') || pathname.includes('profile'))
    return 'radial-gradient(ellipse at 50% 80%, rgba(170,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(255,60,172,0.12) 0%, transparent 50%)';
  if (pathname.includes('notifications'))
    return 'radial-gradient(ellipse at 30% 40%, rgba(0,229,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(170,255,0,0.10) 0%, transparent 50%)';
  return 'radial-gradient(ellipse at 70% 30%, rgba(170,255,0,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(255,60,172,0.12) 0%, transparent 50%)';
};

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);
  const bg = getBgFromPath(location.pathname);
  const glow = getGlowFromPath(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(13,13,13,0.72)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, background: glow }} />
      <Particles count={15} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="flex-1 overflow-y-auto p-6 animate-page-enter" style={{ background: 'transparent' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
