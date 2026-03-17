import { useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import MagneticCursor from './components/ui/MagneticCursor.jsx';

import Login    from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Landing  from './pages/Landing.jsx';

import AdminLayout   from './components/layout/AdminLayout.jsx';
import StudentLayout from './components/layout/StudentLayout.jsx';
import AdminRoutes   from './routes/AdminRoutes.jsx';
import StudentRoutes from './routes/StudentRoutes.jsx';

import AdminDashboard     from './pages/admin/Dashboard.jsx';
import AdminEvents        from './pages/admin/Events.jsx';
import EventForm          from './pages/admin/EventForm.jsx';
import AdminRegistrations from './pages/admin/Registrations.jsx';
import AdminUsers         from './pages/admin/Users.jsx';
import AdminCertificates  from './pages/admin/Certificates.jsx';
import AdminNotifications from './pages/admin/Notifications.jsx';
import Analytics          from './pages/admin/Analytics.jsx';

import StudentDashboard     from './pages/student/Dashboard.jsx';
import StudentEvents        from './pages/student/Events.jsx';
import EventDetail          from './pages/student/EventDetail.jsx';
import StudentRegistrations from './pages/student/Registrations.jsx';
import StudentCertificates  from './pages/student/Certificates.jsx';
import StudentNotifications from './pages/student/Notifications.jsx';
import Profile              from './pages/student/Profile.jsx';

// Page transition wrapper
const AnimatedPage = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Curtain sweep */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'linear-gradient(90deg, #AAFF00, #00E5FF)',
            transformOrigin: 'right',
            pointerEvents: 'none',
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const RootLayout = () => (
  <AuthProvider><Outlet /></AuthProvider>
);

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D' }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 96, color: '#AAFF00', textShadow: '0 0 40px #AAFF00', lineHeight: 1, margin: 0 }}>404</h1>
      <p style={{ color: '#8B6BA8', marginBottom: 24 }}>Page not found.</p>
      <a href="/" className="btn-neon">Go Home</a>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/',         element: <AnimatedPage><Landing /></AnimatedPage>  },
      { path: '/login',    element: <AnimatedPage><Login /></AnimatedPage>    },
      { path: '/register', element: <AnimatedPage><Register /></AnimatedPage> },
      {
        path: '/admin', element: <AdminRoutes />,
        children: [{
          element: <AdminLayout />,
          children: [
            { index: true,             element: <Navigate to="/admin/dashboard" replace /> },
            { path: 'dashboard',       element: <AdminDashboard />    },
            { path: 'events',          element: <AdminEvents />       },
            { path: 'events/create',   element: <EventForm />         },
            { path: 'events/:id/edit', element: <EventForm />         },
            { path: 'registrations',   element: <AdminRegistrations />},
            { path: 'users',           element: <AdminUsers />        },
            { path: 'certificates',    element: <AdminCertificates /> },
            { path: 'notifications',   element: <AdminNotifications />},
            { path: 'analytics',       element: <Analytics />         },
          ],
        }],
      },
      {
        path: '/dashboard', element: <StudentRoutes />,
        children: [{
          element: <StudentLayout />,
          children: [
            { index: true,           element: <StudentDashboard />     },
            { path: 'events',        element: <StudentEvents />        },
            { path: 'events/:id',    element: <EventDetail />          },
            { path: 'registrations', element: <StudentRegistrations /> },
            { path: 'certificates',  element: <StudentCertificates />  },
            { path: 'notifications', element: <StudentNotifications /> },
            { path: 'profile',       element: <Profile />              },
          ],
        }],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

const App = () => {
  const [loaded, setLoaded] = useState(false);
  return (
    <ErrorBoundary>
      <MagneticCursor />
      <LoadingScreen onDone={() => setLoaded(true)} />
      <motion.div
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <RouterProvider router={router} />
      </motion.div>
    </ErrorBoundary>
  );
};

export default App;
