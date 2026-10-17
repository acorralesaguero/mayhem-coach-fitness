import { useTranslation } from "@/lib/i18n";
import { Skeleton } from "./ui/skeleton";
export function PageSkeleton() {
  const { t } = useTranslation();
  return (
    <div aria-label={t("Loading")} className="space-y-5 py-5">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
