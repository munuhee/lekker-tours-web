import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <div className="flex min-h-[72vh] items-end bg-forest-900">
        <div className="container-page pb-14 pt-32">
          <Skeleton className="mb-5 h-3 w-56 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-2xl bg-white/10" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl bg-white/10" />
          <div className="mt-7 flex flex-wrap gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-32 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid gap-3 pt-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4 pt-8">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-card" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[540px] rounded-card" />
      </div>
    </>
  );
}
