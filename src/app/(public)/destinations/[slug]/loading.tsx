import { CardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <div className="flex min-h-[72vh] items-end bg-forest-900">
        <div className="container-page pb-14 pt-32">
          <Skeleton className="mb-5 h-3 w-56 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-lg bg-white/10" />
          <Skeleton className="mt-5 h-4 w-full max-w-md bg-white/10" />
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      </div>

      <div className="container-page pb-16">
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}
