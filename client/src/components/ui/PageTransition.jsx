import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const curtainVariants = {
  initial: { scaleX: 0, originX: 0 },
  animate: { scaleX: 1, originX: 0, transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] } },
  exit:    { scaleX: 0, originX: 1, transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1], delay: 0.1 } },
};

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25, ease: 'easeIn' } },
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Curtain wipe */}
        <motion.div
          key={`curtain-${location.pathname}`}
          variants={curtainVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'linear-gradient(90deg, #AAFF00 0%, #00E5FF 100%)',
            pointerEvents: 'none',
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
