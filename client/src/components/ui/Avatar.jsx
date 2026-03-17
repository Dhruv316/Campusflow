import { getInitials } from '../../utils/helpers.js';

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const initials = getInitials(name);

  return (
    <div
      className={`
        relative rounded-full shrink-0 overflow-hidden
        ring-2 ring-border hover:ring-lime transition-all duration-200
        ${sizeMap[size] ?? sizeMap.md}
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={name ?? 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #4A1080, #AAFF0044)' }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
