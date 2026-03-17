import { useState } from 'react';
import { Zap, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.js';

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to CampusFlow!');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0D0D0D' }}>
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        <img src="/images/bg6.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'rgba(13,13,13,0.45)' }} />
        <div className="relative z-10 text-center px-12">
          <Zap className="w-14 h-14 text-lime fill-lime mx-auto mb-4" />
          <h1 className="text-display text-white" style={{ fontSize: 96, lineHeight: 0.9, letterSpacing: 4 }}>
            CAMPUS<br /><span className="text-lime">FLOW</span>
          </h1>
          <p className="text-white/70 mt-6 text-lg max-w-xs mx-auto">The all-in-one platform for campus event management</p>
          <div className="mt-8 flex flex-col gap-3">
            {['✦ Instant QR ticket generation', '✦ Digital certificates', '✦ Real-time notifications'].map((f) => (
              <p key={f} className="text-white/60 font-medium">{f}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 justify-center mb-10 lg:hidden">
            <Zap className="w-7 h-7 text-lime fill-lime" />
            <span className="text-display text-2xl text-lime tracking-[3px]">CAMPUSFLOW</span>
          </div>
          <div style={{ background: '#1A0A2E', border: '1px solid #4A1080', borderRadius: 20, padding: 40 }}>
            <h2 className="text-display text-white tracking-[2px] mb-2" style={{ fontSize: 48 }}>WELCOME</h2>
            <p className="mb-10" style={{ color: '#8B6BA8', fontSize: 15 }}>Choose how you want to enter CampusFlow</p>
            <div className="space-y-4">
              <button
                onClick={() => handleLogin('admin@campusflow.app', 'Admin@123')}
                disabled={loading}
                className="w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-200"
                style={{ background: '#0D0D0D', border: '1px solid #4A1080', opacity: loading ? 0.6 : 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#AAFF00'; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#4A1080'}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#AAFF0022', border: '1px solid #AAFF0044' }}>
                  <Shield className="w-7 h-7" style={{ color: '#AAFF00' }} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-white text-lg">Login as Admin</p>
                  <p className="text-sm mt-0.5" style={{ color: '#8B6BA8' }}>Full access — manage events, users & analytics</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#AAFF0022' }}>
                  <span style={{ color: '#AAFF00', fontSize: 18 }}>→</span>
                </div>
              </button>
              <button
                onClick={() => handleLogin('arjun.sharma@student.campusflow.app', 'Student@123')}
                disabled={loading}
                className="w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-200"
                style={{ background: '#0D0D0D', border: '1px solid #4A1080', opacity: loading ? 0.6 : 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#00E5FF'; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#4A1080'}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#00E5FF22', border: '1px solid #00E5FF44' }}>
                  <User className="w-7 h-7" style={{ color: '#00E5FF' }} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-white text-lg">Login as Student</p>
                  <p className="text-sm mt-0.5" style={{ color: '#8B6BA8' }}>Browse events, register & download certificates</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#00E5FF22' }}>
                  <span style={{ color: '#00E5FF', fontSize: 18 }}>→</span>
                </div>
              </button>
            </div>
            {loading && (
              <p className="text-center text-sm mt-6" style={{ color: '#8B6BA8' }}>Signing you in...</p>
            )}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid #2D1050' }}>
              <p className="text-center text-sm" style={{ color: '#8B6BA8' }}>
                New here?{' '}
                <a href="/register" className="font-bold" style={{ color: '#00E5FF' }}>Create an account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;