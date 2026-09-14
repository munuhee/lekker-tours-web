import { CardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <div className="flex min-h-[56vh] items-end bg-forest-900">
        <div className="container-page pb-14 pt-32">
          <Skeleton className="mb-5 h-3 w-40 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-lg bg-white/10" />
        </div>
      </div>
      <div className="container-page py-16">
        <CardGridSkeleton count={6} />
      </div>
    </>
  );
}
