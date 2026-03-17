import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, actions = [] }) => (
  <motion.div
    initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }}
    transition={{ type:'spring',stiffness:200,damping:20 }}
    style={{ marginBottom:32,paddingBottom:24,borderBottom:'1px solid #2D1050',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}
  >
    <div>
      <motion.h1
        initial={{ opacity:0,x:-30 }} animate={{ opacity:1,x:0 }}
        transition={{ type:'spring',stiffness:150,damping:15,delay:0.1 }}
        style={{
          fontFamily:"'Bebas Neue'",
          fontSize:'clamp(36px,5vw,60px)',
          letterSpacing:3,
          margin:0, lineHeight:1,
          color:'white',
          WebkitTextStroke:'2px rgba(255,255,255,0.15)',
          textShadow:'3px 3px 0 rgba(0,0,0,0.5), 0 0 20px rgba(170,255,0,0.15)',
        }}
      >{title}</motion.h1>
      {subtitle && (
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          style={{ color:'#8B6BA8',fontSize:13,marginTop:6,margin:'6px 0 0' }}>{subtitle}</motion.p>
      )}
    </div>
    {actions.length > 0 && (
      <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.2 }}
        style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
        {actions.map((action, i) => (
          <motion.button key={i} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={action.onClick} disabled={action.disabled}
            className={`btn-vegas ${action.variant==='danger'?'':'btn-vegas-lime'}`}
            style={{ fontSize:13,padding:'10px 22px',letterSpacing:2 }}>
            {action.icon && <action.icon size={14}/>}
            {action.label}
          </motion.button>
        ))}
      </motion.div>
    )}
  </motion.div>
);

export default PageHeader;
