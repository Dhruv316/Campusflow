import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CalendarDays, MapPin, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { format, isPast, formatDistanceToNow, isValid } from 'date-fns';
import Badge from '../ui/Badge.jsx';

const CATEGORY_IMAGES = {
  TECHNICAL:      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
  CULTURAL:       'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
  SPORTS:         'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
  WORKSHOP:       'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
  SEMINAR:        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  GUEST_LECTURE:  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
  CLUB:           'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  PLACEMENT:      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
  AWARD_CEREMONY: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80',
  COMPETITION:    'https://images.unsplash.com/photo-1561489413-985b06da5bee?w=600&q=80',
  OTHER:          'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80',
};

const safeDate = (d) => { const dt = new Date(d); return isValid(dt) ? dt : null; };

const EventCard = ({ event, onRegister, showAdminActions, onEdit, onDelete, index = 0 }) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100,100], [6,-6]), { stiffness:300,damping:30 });
  const rotateY = useSpring(useTransform(x, [-100,100], [-6,6]), { stiffness:300,damping:30 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width/2);
    y.set(e.clientY - rect.top - rect.height/2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); setHovered(false); };

  const startDate = safeDate(event.startDate);
  const deadline = safeDate(event.registrationDeadline);
  const deadlinePast = deadline ? isPast(deadline) : false;
  const capacityPct = event.maxCapacity > 0 ? Math.min((event.currentRegistrations/event.maxCapacity)*100,100) : 0;
  const isFull = event.maxCapacity > 0 && event.currentRegistrations >= event.maxCapacity;
  const bannerImg = event.bannerImage || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.OTHER;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/dashboard/events/${event.id}`);
  };

  const borderColor = hovered ? '#AAFF00' : '#4A1080';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0,y:-50,rotate:Math.random()*4-2 }}
      animate={{ opacity:1,y:0,rotate:0 }}
      transition={{ type:'spring',stiffness:160,damping:18,delay:index*0.07 }}
      style={{ rotateX,rotateY,transformStyle:'preserve-3d',transformPerspective:1000,cursor:'none',position:'relative' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Electric border on hover */}
      {hovered && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          style={{ position:'absolute',inset:-1,borderRadius:14,zIndex:0,
            background:'linear-gradient(90deg,#AAFF00,#FF3CAC,#00E5FF,#F5E642,#AAFF00)',
            backgroundSize:'300% 100%',animation:'electricFlow 1.5s linear infinite' }}/>
      )}

      <div style={{
        position:'relative',zIndex:1,
        background:'rgba(0,0,0,0.75)',backdropFilter:'blur(16px)',
        border:`2px solid ${borderColor}`,borderRadius:14,overflow:'hidden',
        boxShadow:hovered?`0 0 20px #AAFF0044,0 0 40px #AAFF0022`:`0 0 8px rgba(74,16,128,0.3)`,
        transition:'border-color 0.25s,box-shadow 0.25s',
      }}>
        {/* Inner dashed border */}
        <div style={{ position:'absolute',inset:4,border:'1px dashed rgba(170,255,0,0.1)',borderRadius:10,pointerEvents:'none',zIndex:0 }}/>

        {/* Banner */}
        <div style={{ height:160,position:'relative',overflow:'hidden' }}>
          <motion.img src={bannerImg} alt="" whileHover={{ scale:1.08 }} transition={{ duration:0.4 }}
            style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)' }}/>

          {/* Floating badges */}
          <motion.div animate={{ y:[0,-4,0] }} transition={{ duration:2.5,repeat:Infinity,ease:'easeInOut' }}
            style={{ position:'absolute',top:12,left:12 }}>
            <Badge variant="default">{event.category?.replace(/_/g,' ')}</Badge>
          </motion.div>
          <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:3,repeat:Infinity,ease:'easeInOut',delay:0.5 }}
            style={{ position:'absolute',top:12,right:12 }}>
            <Badge variant={event.status==='PUBLISHED'?'success':event.status==='ONGOING'?'info':event.status==='COMPLETED'?'default':event.status==='CANCELLED'?'danger':'warning'}>
              {event.status}
            </Badge>
          </motion.div>

          {showAdminActions && (
            <div style={{ position:'absolute',bottom:12,right:12,display:'flex',gap:8 }}>
              <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                onClick={e=>{e.stopPropagation();onEdit?.(event);}}
                style={{ width:32,height:32,borderRadius:6,background:'rgba(0,229,255,0.2)',border:'1px solid #00E5FF66',color:'#00E5FF',display:'flex',alignItems:'center',justifyContent:'center',cursor:'none' }}>
                <Edit size={14}/>
              </motion.button>
              <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                onClick={e=>{e.stopPropagation();onDelete?.(event);}}
                style={{ width:32,height:32,borderRadius:6,background:'rgba(255,60,172,0.2)',border:'1px solid #FF3CAC66',color:'#FF3CAC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'none' }}>
                <Trash2 size={14}/>
              </motion.button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding:20,position:'relative',zIndex:1 }}>
          <h3 className="font-arcade" style={{ fontSize:16,letterSpacing:1,color:'white',margin:'0 0 12px',lineHeight:1.3,
            WebkitTextStroke:'0.5px rgba(255,255,255,0.2)',
            textShadow:'0 0 8px rgba(170,255,0,0.15)' }}>{event.title}</h3>

          <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:14 }}>
            {startDate && (
              <div style={{ display:'flex',alignItems:'center',gap:8,color:'#8B6BA8',fontSize:12 }}>
                <CalendarDays size={12} style={{ color:'#AAFF0088',flexShrink:0 }}/>
                <span>{format(startDate,'MMM d, yyyy')}</span>
              </div>
            )}
            {event.venue && (
              <div style={{ display:'flex',alignItems:'center',gap:8,color:'#8B6BA8',fontSize:12 }}>
                <MapPin size={12} style={{ color:'#AAFF0088',flexShrink:0 }}/>
                <span style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{event.venue}</span>
              </div>
            )}
            {deadline && (
              <div style={{ display:'flex',alignItems:'center',gap:8,color:deadlinePast?'#FF3CAC':'#8B6BA8',fontSize:12 }}>
                <Clock size={12} style={{ color:deadlinePast?'#FF3CAC':'#AAFF0088',flexShrink:0 }}/>
                <span>{deadlinePast?'Registration closed':`Closes ${formatDistanceToNow(deadline,{addSuffix:true})}`}</span>
              </div>
            )}
          </div>

          {/* Capacity bar */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#8B6BA8',marginBottom:5 }}>
              <span style={{ display:'flex',alignItems:'center',gap:4 }}><Users size={11}/> {event.currentRegistrations} / {event.maxCapacity>0?event.maxCapacity:'∞'}</span>
              <span className="font-display" style={{ color:isFull?'#FF3CAC':'#AAFF00',letterSpacing:1,fontSize:12 }}>{isFull?'FULL':`${event.maxCapacity-event.currentRegistrations} LEFT`}</span>
            </div>
            <div style={{ height:3,background:'#2D1050',borderRadius:99,overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${capacityPct}%` }}
                transition={{ duration:1,delay:index*0.1,ease:'easeOut' }}
                style={{ height:'100%',background:isFull?'#FF3CAC':'linear-gradient(90deg,#AAFF00,#00E5FF)',borderRadius:99,boxShadow:`0 0 8px ${isFull?'#FF3CAC':'#AAFF00'}88` }}/>
            </div>
          </div>

          {onRegister && (
            <motion.button
              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={e=>{e.stopPropagation();onRegister(event);}}
              disabled={isFull||deadlinePast||event.status==='CANCELLED'||event.status==='COMPLETED'}
              className="btn-vegas btn-vegas-lime"
              style={{ width:'100%',fontSize:13,padding:'10px',letterSpacing:3,
                opacity:(isFull||deadlinePast||event.status==='CANCELLED'||event.status==='COMPLETED')?0.4:1,
                cursor:(isFull||deadlinePast)?'not-allowed':'none' }}
            >
              {event.status==='CANCELLED'?'CANCELLED':event.status==='COMPLETED'?'COMPLETED':isFull?'EVENT FULL':deadlinePast?'CLOSED':'REGISTER NOW'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
