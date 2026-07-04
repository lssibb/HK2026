import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shown when a query fails — explains the problem and offers a retry. */
export function ErrorState({
  onRetry,
  title = "Не удалось загрузить данные",
  description = "Проверьте соединение и попробуйте снова.",
  className,
}: {
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-warn/50 bg-warn-soft/40 px-6 py-14 text-center",
        className
      )}
    >
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-warn-soft text-warn">
        <TriangleAlert className="size-7" />
      </span>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}
