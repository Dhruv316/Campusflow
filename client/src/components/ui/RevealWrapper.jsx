import useScrollReveal from '../../hooks/useScrollReveal.js';

const RevealWrapper = ({ children, animation = 'fade-up', delay = 0, className = '' }) => {
  const [ref, isVisible] = useScrollReveal();

  const animations = {
    'fade-up':    'fadeSlideUp',
    'fade-left':  'fadeSlideLeft',
    'fade-right': 'fadeSlideRight',
    'slam':       'slamIn',
    'explode':    'explodeOut',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? `${animations[animation] ?? 'fadeSlideUp'} 0.6s ${delay}s cubic-bezier(0.16,1,0.3,1) both` : 'none',
      }}
    >
      {children}
    </div>
  );
};

export default RevealWrapper;
