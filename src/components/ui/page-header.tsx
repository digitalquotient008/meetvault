type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
};

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
