import { cn } from "../../lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = ({ label, className, ...props }: InputProps) => (
  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
    {label && <span>{label}</span>}
    <input
      className={cn(
        "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
        className
      )}
      {...props}
    />
  </label>
);
