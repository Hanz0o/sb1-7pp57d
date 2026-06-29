import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useApp } from '../state/AppStore';

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
};
const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((tst) => {
        const Icon = ICONS[tst.kind];
        return (
          <div
            key={tst.id}
            className={`pointer-events-auto flex animate-fade-up items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lift ${STYLES[tst.kind]}`}
          >
            <Icon size={18} />
            {tst.message}
          </div>
        );
      })}
    </div>
  );
}
