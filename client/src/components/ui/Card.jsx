const Card = ({ children, className = '', hover = false, ...props }) => (
  <div
    className={`
      bg-card border border-border rounded-2xl
      transition-all duration-200
      ${hover ? 'hover:border-lime hover:shadow-lime-card cursor-pointer' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);

export default Card;
