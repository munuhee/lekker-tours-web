import { CardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <div className="relative flex min-h-[70vh] items-center justify-center bg-forest-900">
        <div className="container-page flex flex-col items-center gap-5 pt-20">
          <Skeleton className="h-3 w-48 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-2xl bg-white/10" />
          <Skeleton className="h-4 w-full max-w-md bg-white/10" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="container-page py-20">
        <div className="mb-12 flex flex-col items-center gap-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-full max-w-lg" />
        </div>
        <CardGridSkeleton count={6} />
      </div>
    </div>
  );
}
