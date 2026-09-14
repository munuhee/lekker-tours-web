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
        <div className="mb-12 flex flex-col items-center gap-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-full max-w-md" />
        </div>
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}
