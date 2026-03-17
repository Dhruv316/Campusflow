import Button from './Button.jsx';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-raised border border-border flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-lime" />
      </div>
    )}
    <h3 className="text-display text-2xl text-white tracking-[2px] mb-2">{title}</h3>
    {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
    {action && (
      <div className="mt-6">
        <Button onClick={action.onClick}>{action.label}</Button>
      </div>
    )}
  </div>
);

export default EmptyState;
