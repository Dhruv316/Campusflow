import { useMemo } from 'react';

const Particles = ({ count = 20 }) => {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
    driftX: (Math.random() - 0.5) * 80,
    color: ['#AAFF00', '#FF3CAC', '#00E5FF', '#F5E642'][Math.floor(Math.random() * 4)],
    opacity: Math.random() * 0.5 + 0.1,
  })), [count]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          bottom: '-10px',
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          '--drift-x': `${p.driftX}px`,
          animation: `particleDrift ${p.duration}s ${p.delay}s linear infinite`,
          opacity: p.opacity,
        }} />
      ))}
    </div>
  );
};

export default Particles;
