const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

const Spinner = ({ size = 'md', className = '' }) => (
  <div
    className={`
      ${sizeMap[size] ?? sizeMap.md}
      rounded-full border-2 border-border border-t-lime
      animate-spin ${className}
    `}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;
