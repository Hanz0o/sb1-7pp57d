import { Plane, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../../state/AppStore';

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="mt-20 border-t border-ink-100 bg-white">
      <div className="container-page py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-extrabold text-ink-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Plane size={16} className="rtl-flip" />
              </span>
              <span className="text-lg">Voya</span>
            </div>
            <p className="mt-3 text-sm text-ink-500">{t('footer.tagline')}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-ink-500 sm:grid-cols-3">
            {['Flights', 'Hotels', 'Deals', 'My Trips', 'Help', 'About'].map((x) => (
              <span key={x} className="cursor-pointer hover:text-ink-800">{x}</span>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row">
          <span>© 2026 Voya — voya.com</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> PCI-DSS SAQ-A</span>
            <span className="inline-flex items-center gap-1.5"><Lock size={14} /> 3-D Secure</span>
          </div>
          <span>{t('footer.note')}</span>
        </div>
      </div>
    </footer>
  );
}
