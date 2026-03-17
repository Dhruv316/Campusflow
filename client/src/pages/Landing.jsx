import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CalendarDays, QrCode, Award, BarChart3, Bell, Shield, ArrowRight, Menu, X, Play } from 'lucide-react';

/* ── Navbar ─────────────────────────────────────────────────────────────── */
const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ position:'sticky',top:0,zIndex:50,background:'rgba(13,13,13,0.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid #2D1050' }}>
      <div style={{ maxWidth:1152,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none' }}>
          <Zap style={{ width:24,height:24,color:'#AAFF00',fill:'#AAFF00',filter:'drop-shadow(0 0 8px #AAFF00)' }} />
          <span className="font-display text-neon-lime" style={{ fontSize:26,letterSpacing:5 }}>CAMPUSFLOW</span>
        </Link>
        <nav className="hidden md:flex" style={{ gap:32,alignItems:'center' }}>
          {['Features','How it Works','Stats'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`}
              style={{ color:'#8B6BA8',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',textDecoration:'none',transition:'color 0.2s' }}
              onMouseEnter={e=>e.target.style.color='#AAFF00'} onMouseLeave={e=>e.target.style.color='#8B6BA8'}>{item}</a>
          ))}
        </nav>
        <div className="hidden md:flex" style={{ gap:12,alignItems:'center' }}>
          <Link to="/login" style={{ color:'#8B6BA8',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',textDecoration:'none',padding:'8px 16px',transition:'color 0.2s' }}
            onMouseEnter={e=>e.target.style.color='#AAFF00'} onMouseLeave={e=>e.target.style.color='#8B6BA8'}>Login</Link>
          <Link to="/register" className="btn-vegas btn-vegas-lime" style={{ fontSize:13,padding:'10px 24px',letterSpacing:3 }}>Get Started</Link>
        </div>
        <button className="md:hidden" style={{ color:'#AAFF00',background:'none',border:'none',cursor:'none' }} onClick={()=>setOpen(v=>!v)}>
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>
      {open && (
        <div style={{ background:'rgba(13,13,13,0.96)',borderTop:'1px solid #2D1050',padding:'16px 24px' }}>
          {['Features','How it Works','Stats'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} onClick={()=>setOpen(false)}
              style={{ display:'block',color:'#8B6BA8',fontSize:12,fontWeight:700,letterSpacing:2,textTransform:'uppercase',textDecoration:'none',padding:'10px 0' }}>{item}</a>
          ))}
          <div style={{ marginTop:12,display:'flex',flexDirection:'column',gap:8 }}>
            <Link to="/login" className="btn-vegas" style={{ textAlign:'center',fontSize:13 }}>Login</Link>
            <Link to="/register" className="btn-vegas btn-vegas-lime" style={{ textAlign:'center',fontSize:13 }}>Get Started Free</Link>
          </div>
        </div>
      )}
    </header>
  );
};

/* ── Mock Card ───────────────────────────────────────────────────────────── */
const MockCard = () => (
  <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:3,repeat:Infinity,ease:'easeInOut' }}
    className="card-marquee dotted-lights" style={{ width:288 }}>
    <div style={{ height:120,background:'linear-gradient(135deg,#1A0A2E,#4A1080)',borderRadius:8,marginBottom:16,position:'relative',overflow:'hidden' }}>
      <span style={{ position:'absolute',top:10,left:10,padding:'3px 10px',borderRadius:4,background:'rgba(0,0,0,0.8)',color:'#AAFF00',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',border:'1px solid #AAFF0066' }}>Technical</span>
      <span style={{ position:'absolute',top:10,right:10,padding:'3px 10px',borderRadius:4,background:'rgba(170,255,0,0.15)',color:'#AAFF00',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',border:'1px solid #AAFF0044' }}>Published</span>
    </div>
    <p className="font-display" style={{ color:'white',fontSize:18,margin:'0 0 8px',letterSpacing:1 }}>TechSprint 2025</p>
    <div style={{ display:'flex',alignItems:'center',gap:6,color:'#8B6BA8',fontSize:12,marginBottom:10 }}>
      <CalendarDays size={12} style={{ color:'#AAFF00' }}/><span>Dec 15 · Main Auditorium</span>
    </div>
    <div style={{ height:3,background:'#2D1050',borderRadius:99,marginBottom:12,overflow:'hidden' }}>
      <div style={{ width:'71%',height:'100%',background:'linear-gradient(90deg,#AAFF00,#00E5FF)',borderRadius:99,boxShadow:'0 0 8px #AAFF0088' }}/>
    </div>
    <button className="btn-vegas btn-vegas-lime" style={{ width:'100%',fontSize:13,padding:'10px' }}>Register Now</button>
  </motion.div>
);

/* ── Feature Card ────────────────────────────────────────────────────────── */
const FEATURE_COLORS = {
  lime:  { border:'#AAFF00', card:'card-marquee',                      icon:'#AAFF00' },
  cyan:  { border:'#00E5FF', card:'card-marquee card-marquee-cyan',    icon:'#00E5FF' },
  yellow:{ border:'#F5E642', card:'card-marquee card-marquee-yellow',  icon:'#F5E642' },
  pink:  { border:'#FF3CAC', card:'card-marquee card-marquee-pink',    icon:'#FF3CAC' },
};

const FeatureCard = ({ icon:Icon, title, desc, colorKey, delay }) => {
  const c = FEATURE_COLORS[colorKey] || FEATURE_COLORS.lime;
  return (
    <motion.div
      initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }}
      viewport={{ once:true,margin:'-50px' }}
      transition={{ type:'spring',stiffness:150,damping:20,delay }}
      className={`${c.card} dotted-lights`}
      style={{ cursor:'none' }}
    >
      {/* Icon in a neon lit box */}
      <div style={{ width:52,height:52,borderRadius:10,background:`${c.border}15`,border:`1px solid ${c.border}44`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,boxShadow:`0 0 10px ${c.border}33` }}>
        <Icon size={22} style={{ color:c.icon,filter:`drop-shadow(0 0 4px ${c.icon})` }}/>
      </div>
      {/* Title in Bangers with outline */}
      <p className="font-arcade" style={{ fontSize:22,letterSpacing:2,color:'white',margin:'0 0 8px',
        WebkitTextStroke:'1px rgba(255,255,255,0.1)',
        textShadow:`0 0 10px ${c.border}44` }}>{title}</p>
      <p style={{ color:'#8B6BA8',fontSize:13,lineHeight:1.6,margin:0 }}>{desc}</p>
    </motion.div>
  );
};

const features = [
  { icon:CalendarDays, title:'Smart Event Discovery',    desc:'Filter by category, date, and department. Never miss what matters.',                 colorKey:'lime'   },
  { icon:QrCode,       title:'Instant QR Registration', desc:'Register in one click. Your QR ticket is generated automatically.',                  colorKey:'cyan'   },
  { icon:Award,        title:'Digital Certificates',    desc:'Verified certificates issued instantly after attendance. PDF download.',             colorKey:'yellow' },
  { icon:BarChart3,    title:'Powerful Analytics',       desc:'Real-time insights on attendance, ratings, and event trends.',                      colorKey:'pink'   },
  { icon:Bell,         title:'Live Notifications',       desc:'Get notified about new events, approvals, and certificates instantly.',             colorKey:'lime'   },
  { icon:Shield,       title:'Role-Based Access',        desc:'Separate dashboards for admins and students. Secure by design.',                    colorKey:'cyan'   },
];

/* ── Stat Item with LED style ────────────────────────────────────────────── */
const StatItem = ({ value, label }) => {
  const ref = useRef(null);
  return (
    <motion.div ref={ref} initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }}
      viewport={{ once:true }} transition={{ type:'spring',stiffness:150,damping:15 }}
      style={{ textAlign:'center' }}>
      {/* LED scoreboard number */}
      <div className="sign-vintage dotted-lights" style={{ display:'inline-block',padding:'12px 28px',marginBottom:12 }}>
        <p className="text-led" style={{ fontSize:'clamp(36px,5vw,64px)',margin:0,lineHeight:1 }}>{value}</p>
      </div>
      <p className="font-arcade" style={{ fontSize:13,color:'white',letterSpacing:3,margin:0,textTransform:'uppercase',
        WebkitTextStroke:'1px rgba(255,255,255,0.3)' }}>{label}</p>
    </motion.div>
  );
};

/* ── How It Works Step ───────────────────────────────────────────────────── */
const Step = ({ n, title, desc, delay }) => (
  <motion.div
    initial={{ opacity:1, y:0 }}
    style={{ display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',position:'relative',zIndex:10 }}>
    {/* Vegas style number circle */}
    <div className="dotted-lights animate-sign-glow" style={{
      width:72,height:72,borderRadius:'50%',
      background:'linear-gradient(135deg,#0a1a0a,#0d2a0d)',
      border:'3px solid #AAFF00',
      display:'flex',alignItems:'center',justifyContent:'center',
      marginBottom:20,
      boxShadow:'0 0 15px #AAFF0088, inset 0 0 15px rgba(170,255,0,0.1)',
      flexShrink:0,
    }}>
      <span className="text-led-green" style={{ fontSize:18 }}>{n}</span>
    </div>
    <p className="font-arcade" style={{ fontSize:18,color:'white',margin:'0 0 8px',letterSpacing:2,
      WebkitTextStroke:'1px rgba(255,255,255,0.2)',
      textShadow:'0 0 10px rgba(170,255,0,0.2)' }}>{title}</p>
    <p style={{ color:'#8B6BA8',fontSize:13,margin:0,lineHeight:1.6 }}>{desc}</p>
  </motion.div>
);

/* ── Landing ─────────────────────────────────────────────────────────────── */
const Landing = () => (
  <div style={{ minHeight:'100vh',background:'#0D0D0D',color:'white' }}>
    <Navbar/>

    {/* ── HERO ──────────────────────────────────────────────────────────── */}
    <section style={{ position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',overflow:'hidden' }}>
      <div style={{ position:'absolute',inset:0,zIndex:0 }}>
        <img src="/images/bg6.png" alt="" style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'center' }}/>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to right,rgba(13,13,13,0.92) 0%,rgba(13,13,13,0.65) 55%,rgba(13,13,13,0.25) 100%)' }}/>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 20% 50%,rgba(74,16,128,0.4) 0%,transparent 60%)' }}/>
      </div>

      <div style={{ position:'relative',zIndex:10,maxWidth:1152,margin:'0 auto',padding:'80px 24px',width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center' }}>
        <div style={{ display:'flex',flexDirection:'column',justifyContent:'center' }}>
          {/* Badge */}
          <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
            style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',borderRadius:4,
              background:'rgba(0,0,0,0.6)',border:'1px solid #AAFF0066',marginBottom:28 }}>
            <span className="text-neon-lime" style={{ fontSize:11,fontWeight:700,letterSpacing:3,textTransform:'uppercase' }}>✦ The Campus Event Platform</span>
          </motion.div>

          {/* Hero headline — 3D comic style */}
          <h1 style={{ margin:'0 0 28px',lineHeight:0.85 }}>
            {[
              { text:'YOUR', color:'white', delay:0.15 },
              { text:'CAMPUS.', color:'#AAFF00', delay:0.25, glow:true },
              { text:'YOUR', color:'white', delay:0.35 },
              { text:'EVENTS.', color:'#FF3CAC', delay:0.45, glow:true },
            ].map(({ text,color,delay,glow }) => (
              <motion.span key={text+delay}
                initial={{ opacity:0,y:60,skewX:-8 }} animate={{ opacity:1,y:0,skewX:0 }}
                transition={{ type:'spring',stiffness:140,damping:14,delay }}
                style={{
                  display:'block',
                  fontFamily:"'Bebas Neue'",
                  fontSize:'clamp(64px,9vw,110px)',
                  letterSpacing:3,
                  color,
                  WebkitTextStroke: glow ? '3px ' + (color === '#AAFF00' ? '#1a4000' : '#6b0044') : '3px #222',
                  textShadow: glow
                    ? `3px 3px 0 ${color === '#AAFF00' ? '#1a4000' : '#6b0044'}, 6px 6px 0 rgba(0,0,0,0.4), 0 0 30px ${color}66`
                    : '3px 3px 0 #111, 6px 6px 0 rgba(0,0,0,0.3)',
                }}
              >{text}</motion.span>
            ))}
            <motion.span
              initial={{ opacity:0,scale:0.5 }} animate={{ opacity:1,scale:1 }}
              transition={{ type:'spring',stiffness:120,damping:12,delay:0.6 }}
              style={{
                display:'block',
                fontFamily:"'Bebas Neue'",
                fontSize:'clamp(32px,5vw,56px)',
                letterSpacing:4,
                color:'#F5E642',
                WebkitTextStroke:'2px #6b5a00',
                textShadow:'2px 2px 0 #6b5a00, 4px 4px 0 rgba(0,0,0,0.3), 0 0 20px #F5E64288',
              }}>ALL IN ONE PLACE.</motion.span>
          </h1>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
            style={{ fontSize:16,color:'#C9B8E8',maxWidth:460,marginBottom:36,lineHeight:1.7 }}>
            Streamline event discovery, registration, and certificate issuance — built for students and admins who mean business.
          </motion.p>

          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:1 }}
            style={{ display:'flex',gap:16,flexWrap:'wrap' }}>
            <Link to="/register" className="btn-vegas btn-vegas-lime" style={{ fontSize:15,padding:'14px 32px' }}>
              Get Started Free →
            </Link>
            <a href="#how-it-works" className="btn-vegas" style={{ fontSize:15,padding:'14px 32px' }}>
              ▶ How It Works
            </a>
          </motion.div>
        </div>

        {/* Mock card */}
        <div className="hidden lg:flex" style={{ justifyContent:'flex-end',alignItems:'center',position:'relative' }}>
          <MockCard/>
          <motion.div initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} transition={{ delay:1.2 }}
            className="card-marquee" style={{ position:'absolute',bottom:-16,left:-32,padding:'12px 16px',display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:'rgba(170,255,0,0.1)',border:'1px solid #AAFF0044',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Award size={16} style={{ color:'#AAFF00' }}/>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:'white',margin:0 }}>Certificate Ready</p>
              <p style={{ fontSize:10,color:'#8B6BA8',fontFamily:'monospace',margin:0 }}>CF-2025-A3K9PX</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── FEATURES ──────────────────────────────────────────────────────── */}
    <section id="features" style={{ position:'relative',overflow:'hidden',padding:'96px 0' }}>
      <div style={{ position:'absolute',inset:0,zIndex:0 }}>
        <img src="/images/bg5.jpg" alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
        <div style={{ position:'absolute',inset:0,background:'rgba(13,13,13,0.85)' }}/>
      </div>
      <div style={{ position:'relative',zIndex:10,maxWidth:1152,margin:'0 auto',padding:'0 24px' }}>
        <div style={{ textAlign:'center',marginBottom:64 }}>
          {/* LED scoreboard section title */}
          <motion.div initial={{ opacity:0,y:-20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="sign-vintage dotted-lights" style={{ display:'inline-block',padding:'16px 40px',marginBottom:24 }}>
            <p className="text-led" style={{ fontSize:'clamp(14px,2vw,20px)',margin:0,letterSpacing:6 }}>EVERYTHING YOUR CAMPUS NEEDS</p>
          </motion.div>
          <p style={{ color:'#8B6BA8',maxWidth:480,margin:'0 auto',fontSize:14 }}>One platform for students to discover events, admins to manage them, and everyone to grow together.</p>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20 }}>
          {features.map(({ icon,title,desc,colorKey },i) => (
            <FeatureCard key={title} icon={icon} title={title} desc={desc} colorKey={colorKey} delay={i*0.08}/>
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
    <section id="how-it-works" style={{ position:'relative',overflow:'hidden',padding:'96px 0' }}>
      <div style={{ position:'absolute',inset:0,zIndex:0 }}>
        <img src="/images/bg4.jpg" alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
        <div style={{ position:'absolute',inset:0,background:'rgba(13,13,13,0.82)' }}/>
      </div>
      <div style={{ position:'relative',zIndex:10,maxWidth:960,margin:'0 auto',padding:'0 24px' }}>
        <div style={{ textAlign:'center',marginBottom:64 }}>
          <motion.h2 initial={{ opacity:0,y:-20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(56px,8vw,96px)',lineHeight:0.9,margin:0 }}>
            <span className="text-3d-white">HOW IT </span>
            <span className="text-3d-lime">WORKS</span>
          </motion.h2>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:40,position:'relative' }}>
          {/* Dashed connector */}
          <div style={{ position:'absolute',top:36,left:'16.67%',right:'16.67%',height:2,borderTop:'2px dashed rgba(170,255,0,0.3)',zIndex:0 }} className="hidden md:block"/>
          {[
            { n:'01',title:'Create Account',      desc:'Sign up as a student in seconds. No fees, no friction.',                             delay:0    },
            { n:'02',title:'Browse & Register',   desc:'Discover events by category, date, or keyword. Register in one click.',             delay:0.15 },
            { n:'03',title:'Attend & Get Certified',desc:'Show your QR ticket at the door. Earn verified certificates automatically.',      delay:0.3  },
          ].map(s => <Step key={s.n} {...s}/>)}
        </div>
      </div>
    </section>

    {/* ── STATS ─────────────────────────────────────────────────────────── */}
    <section id="stats" style={{ position:'relative',overflow:'hidden',padding:'72px 0' }}>
      <div style={{ position:'absolute',inset:0,zIndex:0 }}>
        <img src="/images/bg2.jpg" alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
        <div style={{ position:'absolute',inset:0,background:'rgba(13,13,13,0.80)' }}/>
      </div>
      <div style={{ position:'relative',zIndex:10,maxWidth:896,margin:'0 auto',padding:'0 24px' }}>
        {/* LED title */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ textAlign:'center',marginBottom:48 }}>
          <div className="sign-vintage dotted-lights" style={{ display:'inline-block',padding:'10px 32px' }}>
            <p className="text-led" style={{ fontSize:'clamp(10px,1.5vw,14px)',margin:0,letterSpacing:5 }}>TRUSTED BY CAMPUSES EVERYWHERE</p>
          </div>
        </motion.div>
        <div style={{ display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'flex-start',gap:48,flexWrap:'wrap' }}>
          {[['500+','Events Created'],['12,000+','Student Registrations'],['98%','Satisfaction Rate']].map(([v,l]) => (
            <StatItem key={l} value={v} label={l}/>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section style={{ position:'relative',overflow:'hidden',padding:'96px 0' }}>
      <div style={{ position:'absolute',inset:0,zIndex:0 }}>
        <img src="/images/bg3.jpg" alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
        <div style={{ position:'absolute',inset:0,background:'rgba(13,13,13,0.82)' }}/>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%,rgba(170,255,0,0.06) 0%,transparent 70%)' }}/>
      </div>
      <div style={{ position:'relative',zIndex:10,maxWidth:768,margin:'0 auto',textAlign:'center',padding:'0 24px' }}>
        <motion.h2 initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          style={{ fontFamily:"'Bebas Neue'",fontSize:'clamp(48px,7vw,88px)',lineHeight:0.9,margin:'0 0 24px' }}>
          <span className="text-3d-white">READY TO TRANSFORM </span><br/>
          <span className="text-3d-lime">YOUR CAMPUS?</span>
        </motion.h2>
        <p style={{ color:'#C9B8E8',marginBottom:40,fontSize:16 }}>Join thousands of students already using CampusFlow.</p>
        <motion.div whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}>
          <Link to="/register" className="btn-vegas btn-vegas-lime animate-sign-glow" style={{ fontSize:16,padding:'16px 48px',letterSpacing:4 }}>
            GET STARTED FREE →
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── FOOTER ────────────────────────────────────────────────────────── */}
    <footer style={{ background:'#0D0D0D',borderTop:'1px solid #2D1050',padding:'64px 24px 32px' }}>
      <div style={{ maxWidth:1152,margin:'0 auto' }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:40,marginBottom:48 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
              <Zap style={{ width:20,height:20,color:'#AAFF00',fill:'#AAFF00' }}/>
              <span className="font-display text-neon-lime" style={{ fontSize:20,letterSpacing:4 }}>CAMPUSFLOW</span>
            </div>
            <p style={{ color:'#8B6BA8',fontSize:13 }}>Built for students, by students.</p>
          </div>
          {[
            { title:'Product', links:['Features','How it Works','Pricing'] },
            { title:'Company', links:['About','Blog','Careers'] },
            { title:'Legal',   links:['Privacy Policy','Terms of Service'] },
          ].map(({ title,links }) => (
            <div key={title}>
              <h4 style={{ fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#C9B8E8',marginBottom:16 }}>{title}</h4>
              <ul style={{ listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:10 }}>
                {links.map(l => <li key={l}><a href="#" style={{ color:'#8B6BA8',fontSize:13,textDecoration:'none',transition:'color 0.2s' }}
                  onMouseEnter={e=>e.target.style.color='#AAFF00'} onMouseLeave={e=>e.target.style.color='#8B6BA8'}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid #2D1050',paddingTop:32,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12 }}>
          <p style={{ color:'#8B6BA8',fontSize:12,margin:0 }}>© {new Date().getFullYear()} CampusFlow. All rights reserved.</p>
          <p style={{ color:'#8B6BA8',fontSize:12,margin:0 }}>Made with <span style={{ color:'#FF3CAC' }}>♥</span> for students everywhere</p>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
