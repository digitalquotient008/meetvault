type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
        {icon}
      </div>
      <p className="text-white font-medium text-base mb-1">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm text-center max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
