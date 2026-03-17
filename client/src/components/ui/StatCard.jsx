import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color = '#AAFF00' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once:true, margin:'-50px' });
  const [displayVal, setDisplayVal] = useState('0');
  const [scrambling, setScrambling] = useState(false);

  const chars = '0123456789';
  const targetNum = typeof value === 'number' ? value : parseInt(String(value??'0').replace(/\D/g,'')) || 0;
  const suffix = typeof value === 'string' ? value.replace(/[0-9,]/g,'') : '';

  useEffect(() => {
    if (!isInView) return;
    setScrambling(true);
    let frame = 0;
    const total = 30;
    const interval = setInterval(() => {
      frame++;
      if (frame < total * 0.7) {
        setDisplayVal(String(targetNum).split('').map(()=>chars[Math.floor(Math.random()*10)]).join('') + suffix);
      } else if (frame < total) {
        const locked = Math.floor(((frame - total*0.7)/(total*0.3)) * String(targetNum).length);
        setDisplayVal(String(targetNum).slice(0,locked) + String(targetNum).slice(locked).split('').map(()=>chars[Math.floor(Math.random()*10)]).join('') + suffix);
      } else {
        setDisplayVal(value??'0');
        setScrambling(false);
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isInView]);

  const colorMap = {
    '#AAFF00': { text:'text-neon-lime', border:'#AAFF00' },
    '#FF3CAC': { text:'text-neon-pink', border:'#FF3CAC' },
    '#00E5FF': { text:'text-neon-cyan', border:'#00E5FF' },
    '#F5E642': { text:'text-neon-yellow', border:'#F5E642' },
  };
  const c = colorMap[color] || colorMap['#AAFF00'];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0,y:30,scale:0.95 }}
      animate={isInView ? { opacity:1,y:0,scale:1 } : {}}
      transition={{ type:'spring',stiffness:200,damping:20 }}
      whileHover={{ scale:1.03,y:-3 }}
      className="card-marquee dotted-lights"
      style={{ cursor:'none', borderColor:c.border, boxShadow:`0 0 12px ${c.border}44,0 0 24px ${c.border}22,inset 0 0 12px ${c.border}08` }}
    >
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
        <p style={{ fontSize:13,fontFamily:"'Bebas Neue'",letterSpacing:4,textTransform:'uppercase',color:'#A89BC0',margin:0 }}>{title}</p>
        {Icon && (
          <div style={{ width:40,height:40,borderRadius:8,background:`${c.border}15`,border:`1px solid ${c.border}44`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 8px ${c.border}33` }}>
            <Icon size={18} style={{ color:c.border,filter:`drop-shadow(0 0 4px ${c.border})` }}/>
          </div>
        )}
      </div>
      {/* LED number display */}
      <div className="sign-vintage" style={{ display:'inline-block',padding:'8px 16px',marginBottom:10,background:'rgba(0,0,0,0.5)' }}>
        <motion.p
          animate={scrambling ? { color:['#AAFF00','#00E5FF','#FF3CAC','#AAFF00'] } : { color:c.border }}
          transition={{ duration:0.3,repeat:scrambling?Infinity:0 }}
          style={{ fontFamily:"'Press Start 2P'",fontSize:'clamp(20px,3vw,32px)',margin:0,lineHeight:1,
            textShadow:`0 0 6px ${c.border}, 0 0 12px ${c.border}88` }}
        >{displayVal}</motion.p>
      </div>
      {trend && (
        <p style={{ fontSize:12,color:trend.isPositive?'#AAFF00':'#FF3CAC',margin:0,fontWeight:700,fontFamily:"'Bebas Neue'",letterSpacing:1 }}>
          {trend.isPositive?'▲':'▼'} {trend.value}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
