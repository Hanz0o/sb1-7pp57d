import { Sparkles } from 'lucide-react';
import { PriceBreakdown } from '../../domain/types';
import { useApp } from '../../state/AppStore';

export function PriceBreakdownView({
  pricing,
  compact = false,
}: {
  pricing: PriceBreakdown;
  compact?: boolean;
}) {
  const { t, fmt } = useApp();
  return (
    <div className="space-y-2">
      <dl className="space-y-1.5 text-sm">
        {pricing.lines.map((line) => (
          <div key={line.key} className="flex items-center justify-between gap-4">
            <dt className={line.kind === 'discount' ? 'text-emerald-600' : 'text-ink-600'}>
              {t(line.labelKey)}
            </dt>
            <dd
              className={`tabular-nums font-medium ${
                line.kind === 'discount' ? 'text-emerald-600' : 'text-ink-800'
              }`}
            >
              {fmt(line.amount)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between border-t border-ink-100 pt-2.5">
        <span className="font-bold text-ink-900">{t('common.total')}</span>
        <span className="text-lg font-extrabold tabular-nums text-ink-900">{fmt(pricing.total)}</span>
      </div>
      {!compact && (
        <p className="text-xs text-ink-400">{t('common.taxesIncluded')}</p>
      )}
      {pricing.pointsEarned > 0 && (
        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-brand-700">
          <Sparkles size={14} />
          {t('price.youEarn')} {pricing.pointsEarned.toLocaleString()} {t('price.points')}
        </div>
      )}
    </div>
  );
}
