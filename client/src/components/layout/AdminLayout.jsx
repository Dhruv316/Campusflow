import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import TopBar from './TopBar.jsx';
import Particles from '../ui/Particles.jsx';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (s) => UUID_PATTERN.test(s);

const getTitleFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean).filter((s) => !isUUID(s));
  const last = segments[segments.length - 1];
  const map = {
    admin: 'Dashboard', dashboard: 'Dashboard', events: 'Events',
    create: 'Create Event', edit: 'Edit Event', registrations: 'Registrations',
    users: 'Users', certificates: 'Certificates', notifications: 'Notifications',
    analytics: 'Analytics',
  };
  return map[last] ?? (last ? last.charAt(0).toUpperCase() + last.slice(1) : 'Dashboard');
};

const getBgFromPath = (pathname) => {
  if (pathname.includes('registrations') || pathname.includes('users')) return '/images/bg2.jpg';
  if (pathname.includes('certificates')) return '/images/bg3.jpg';
  if (pathname.includes('notifications') || pathname.includes('analytics')) return '/images/bg4.jpg';
  return '/images/bg1.jpg';
};

const getGlowFromPath = (pathname) => {
  if (pathname.includes('registrations') || pathname.includes('users'))
    return 'radial-gradient(ellipse at 20% 50%, rgba(0,229,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(170,255,0,0.10) 0%, transparent 50%)';
  if (pathname.includes('certificates'))
    return 'radial-gradient(ellipse at 50% 80%, rgba(170,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(255,60,172,0.12) 0%, transparent 50%)';
  if (pathname.includes('notifications') || pathname.includes('analytics'))
    return 'radial-gradient(ellipse at 30% 40%, rgba(0,229,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(170,255,0,0.10) 0%, transparent 50%)';
  return 'radial-gradient(ellipse at 60% 30%, rgba(255,120,0,0.20) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(170,255,0,0.12) 0%, transparent 50%)';
};

const AdminLayout = () => {
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
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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

export default AdminLayout;
