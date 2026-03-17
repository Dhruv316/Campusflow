import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MagneticCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const springX = useSpring(cursorX, { stiffness: 120, damping: 18, mass: 0.5 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 18, mass: 0.5 });

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };
    const enter = (e) => {
      const el = e.target.closest('button, a, [data-magnetic], input, select, textarea');
      if (el) {
        setHovering(true);
        // Magnetic pull effect
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        cursorX.set(cx + dx * 0.3);
        cursorY.set(cy + dy * 0.3);
      }
    };
    const leave = () => setHovering(false);
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', enter);
    window.addEventListener('mouseout', leave);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', enter);
      window.removeEventListener('mouseout', leave);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return (
    <>
      {/* Main cursor orb */}
      <motion.div
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: clicking ? 12 : hovering ? 52 : 22,
          height: clicking ? 12 : hovering ? 52 : 22,
          backgroundColor: hovering ? '#AAFF00' : 'transparent',
          borderColor: hovering ? '#AAFF00' : '#AAFF00',
          opacity: 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed pointer-events-none z-[99999] rounded-full border-2 mix-blend-difference"
        style={{
          x: springX, y: springY,
          translateX: '-50%', translateY: '-50%',
          boxShadow: hovering ? '0 0 20px #AAFF00, 0 0 40px #AAFF0066' : '0 0 8px #AAFF0066',
        }}
      />
      {/* Dot */}
      <motion.div
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        className="fixed pointer-events-none z-[99999] w-1.5 h-1.5 rounded-full bg-lime"
      />
    </>
  );
};

export default MagneticCursor;
