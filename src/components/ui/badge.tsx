type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  danger: 'bg-red-500/10 text-red-400',
  info: 'bg-sky-500/10 text-sky-400',
  neutral: 'bg-slate-700/50 text-slate-500',
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
};

export function Badge({ children, variant = 'default', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-400'
              : variant === 'warning'
                ? 'bg-amber-400'
                : variant === 'danger'
                  ? 'bg-red-400'
                  : variant === 'info'
                    ? 'bg-sky-400'
                    : 'bg-slate-500'
          }`}
        />
      )}
      {children}
    </span>
  );
}

/** Map appointment status to badge variant */
export function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'PENDING':
      return 'neutral';
    case 'CONFIRMED':
      return 'warning';
    case 'IN_PROGRESS':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELED':
    case 'NO_SHOW':
      return 'danger';
    default:
      return 'default';
  }
}
