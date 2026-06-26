import { cn } from "../../lib/utils";

export const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h2 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>

    {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
  </div>
);
