type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-slate-400 mt-1 ${className}`}>{children}</p>;
}

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
};

export function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1.5">{value}</p>
          {trend && <p className="text-xs text-emerald-400 mt-1">{trend}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
