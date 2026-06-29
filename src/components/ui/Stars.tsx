import { Star } from 'lucide-react';

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${rating} stars`}>
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function ReviewBadge({ score, label }: { score: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded-lg rounded-bl-sm bg-brand-600 px-2 py-1 text-sm font-bold text-white">
        {score.toFixed(1)}
      </span>
      <span className="text-sm font-semibold text-ink-700">{label}</span>
    </span>
  );
}
