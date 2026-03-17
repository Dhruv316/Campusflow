const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required,
  className = '',
  hint,
  ...props
}) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label
        htmlFor={name}
        className="text-[11px] font-bold uppercase tracking-[1.5px] text-secondary"
      >
        {label}
        {required && <span className="text-lime ml-1">*</span>}
      </label>
    )}

    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      {...(register ? register(name) : {})}
      className={`
        w-full px-4 py-2.5 rounded-lg
        bg-ink border border-border text-white
        placeholder:text-muted text-sm
        focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-pink focus:border-pink focus:ring-pink/20' : ''}
        ${className}
      `}
      {...props}
    />

    {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    {error && <p className="text-xs text-pink font-medium">{error}</p>}
  </div>
);

export default Input;
