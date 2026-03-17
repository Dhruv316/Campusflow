import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const LoadingScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => { setDone(true); setTimeout(onDone, 600); }, 300);
          return 100;
        }
        return p + 1.5;
      });
    }, 18);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Glow orbs */}
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ position: 'absolute', top: '15%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #4A108066 0%, transparent 70%)', pointerEvents: 'none' }} />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            style={{ position: 'absolute', bottom: '15%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #AAFF0022 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.5, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: 56 }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              style={{ display: 'inline-block', marginBottom: 16 }}>
              <Zap style={{ width: 56, height: 56, color: '#AAFF00', fill: '#AAFF00', filter: 'drop-shadow(0 0 20px #AAFF00)' }} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
              style={{ fontFamily: "'Bebas Neue'", fontSize: 72, letterSpacing: 8, color: '#AAFF00', textShadow: '0 0 30px #AAFF00, 0 0 60px #AAFF0066', margin: 0, lineHeight: 1 }}
            >CAMPUSFLOW</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={{ color: '#8B6BA8', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', marginTop: 8 }}>
              The Campus Event Platform
            </motion.p>
          </motion.div>

          {/* Progress */}
          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 300 }} transition={{ delay: 0.5 }}
            style={{ height: 2, background: '#2D1050', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'linear-gradient(90deg, #AAFF00, #00E5FF)', borderRadius: 99, boxShadow: '0 0 10px #AAFF0088', width: `${progress}%`, transition: 'width 0.02s linear' }} />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ color: '#4A1080', fontSize: 11, marginTop: 12, letterSpacing: 3, fontFamily: 'monospace' }}>
            LOADING {Math.round(progress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
