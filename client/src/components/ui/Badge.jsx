const variants = {
  default: { bg:'rgba(139,107,168,0.2)', color:'#C9B8E8', border:'1px solid #4A1080' },
  success: { bg:'rgba(170,255,0,0.15)',  color:'#AAFF00', border:'1px solid #AAFF0066', shadow:'0 0 8px #AAFF0044' },
  warning: { bg:'rgba(245,230,66,0.15)', color:'#F5E642', border:'1px solid #F5E64266', shadow:'0 0 8px #F5E64244' },
  danger:  { bg:'rgba(255,60,172,0.15)', color:'#FF3CAC', border:'1px solid #FF3CAC66', shadow:'0 0 8px #FF3CAC44' },
  info:    { bg:'rgba(0,229,255,0.15)',  color:'#00E5FF', border:'1px solid #00E5FF66', shadow:'0 0 8px #00E5FF44' },
  purple:  { bg:'rgba(108,71,255,0.2)', color:'#A080FF', border:'1px solid #6C47FF66' },
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  const v = variants[variant] || variants.default;
  return (
    <span
      className={className}
      style={{
        display:'inline-flex', alignItems:'center',
        padding:'3px 10px', borderRadius:4,
        fontSize:10, fontFamily:"'Bebas Neue'", letterSpacing:2,
        textTransform:'uppercase',
        background:v.bg, color:v.color, border:v.border,
        boxShadow:v.shadow || 'none',
        whiteSpace:'nowrap',
      }}
    >{children}</span>
  );
};

export default Badge;

// Registration status helpers
export const registrationStatusVariant = (status) => {
  switch (status) {
    case 'APPROVED':   return 'success';
    case 'PENDING':    return 'warning';
    case 'WAITLISTED': return 'info';
    case 'REJECTED':   return 'danger';
    case 'ATTENDED':   return 'purple';
    case 'CANCELLED':  return 'danger';
    default:           return 'default';
  }
};

export const registrationStatusLabel = (status) => {
  switch (status) {
    case 'APPROVED':   return 'Approved';
    case 'PENDING':    return 'Pending';
    case 'WAITLISTED': return 'Waitlisted';
    case 'REJECTED':   return 'Rejected';
    case 'ATTENDED':   return 'Attended';
    case 'CANCELLED':  return 'Cancelled';
    default:           return status ?? 'Unknown';
  }
};

// Event status helpers
export const eventStatusVariant = (status) => {
  switch (status) {
    case 'PUBLISHED':  return 'success';
    case 'DRAFT':      return 'warning';
    case 'CANCELLED':  return 'danger';
    case 'COMPLETED':  return 'info';
    default:           return 'default';
  }
};

export const eventStatusLabel = (status) => {
  switch (status) {
    case 'PUBLISHED':  return 'Published';
    case 'DRAFT':      return 'Draft';
    case 'CANCELLED':  return 'Cancelled';
    case 'COMPLETED':  return 'Completed';
    default:           return status ?? 'Unknown';
  }
};
