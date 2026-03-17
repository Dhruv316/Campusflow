import { useRef } from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner.jsx';

const Button = ({ children, variant = 'primary', size = 'md', isLoading, disabled, onClick, type = 'button', className = '' }) => {
  const ref = useRef(null);

  const addRipple = (e) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const sz = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;width:${sz}px;height:${sz}px;left:${e.clientX-rect.left-sz/2}px;top:${e.clientY-rect.top-sz/2}px;background:rgba(255,255,255,0.25);transform:scale(0);animation:rippleAnim 0.6s linear;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    onClick?.(e);
  };

  const variantClass = {
    primary:   'btn-vegas btn-vegas-lime',
    secondary: 'btn-vegas',
    danger:    'btn-vegas btn-neon-pink',
    ghost:     'btn-vegas',
    info:      'btn-vegas btn-vegas-cyan',
  }[variant] ?? 'btn-vegas btn-vegas-lime';

  const sizeStyle = {
    sm: { fontSize:12, padding:'8px 18px',  letterSpacing:2 },
    md: { fontSize:14, padding:'12px 26px', letterSpacing:3 },
    lg: { fontSize:16, padding:'16px 36px', letterSpacing:3 },
  }[size];

  return (
    <motion.button
      ref={ref} type={type}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale:1.03 } : {}}
      whileTap={!disabled && !isLoading ? { scale:0.96 } : {}}
      onClick={addRipple}
      className={`${variantClass} ${className} ripple-container`}
      style={{ ...sizeStyle, opacity:(disabled||isLoading)?0.5:1, cursor:(disabled||isLoading)?'not-allowed':'none', position:'relative', overflow:'hidden' }}
    >
      {isLoading ? <><Spinner size="sm"/><span style={{ marginLeft:8 }}>Loading...</span></> : children}
    </motion.button>
  );
};

export default Button;
