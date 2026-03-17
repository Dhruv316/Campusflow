const Textarea = ({
  label,
  name,
  placeholder,
  register,
  error,
  required,
  rows = 4,
  className = '',
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

    <textarea
      id={name}
      name={name}
      rows={rows}
      placeholder={placeholder}
      {...(register ? register(name) : {})}
      className={`
        w-full px-4 py-2.5 rounded-lg resize-y
        bg-ink border border-border text-white text-sm
        placeholder:text-muted
        focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20
        transition-all duration-200
        ${error ? 'border-pink focus:border-pink focus:ring-pink/20' : ''}
        ${className}
      `}
      {...props}
    />

    {error && <p className="text-xs text-pink font-medium">{error}</p>}
  </div>
);

export default Textarea;
