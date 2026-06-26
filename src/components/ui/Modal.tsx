import { X } from "lucide-react";
import { Button } from "./Button";

export const Modal = ({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-lg font-bold text-slate-950 sm:text-xl">
            {title}
          </h2>

          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 shrink-0 p-0"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
};
