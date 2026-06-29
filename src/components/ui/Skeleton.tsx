export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function ResultCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4 p-4 sm:flex-row">
      <Skeleton className="h-44 w-full sm:h-40 sm:w-60" />
      <div className="flex-1 space-y-3 py-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
