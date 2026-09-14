import { CardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <div className="flex min-h-[56vh] items-end bg-forest-900">
        <div className="container-page pb-14 pt-32">
          <Skeleton className="mb-5 h-3 w-40 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-xl bg-white/10" />
          <Skeleton className="mt-5 h-4 w-full max-w-lg bg-white/10" />
        </div>
      </div>

      <div className="container-page py-16">
        <div className="mb-10 space-y-6">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-11 w-36 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <CardGridSkeleton count={9} />
      </div>
    </>
  );
}
