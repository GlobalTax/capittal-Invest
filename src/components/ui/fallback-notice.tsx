import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FallbackNoticeProps {
  className?: string;
  message?: string;
}

export const FallbackNotice = ({ 
  className,
  message = "Mostrando datos de ejemplo. Algunos contenidos pueden no estar actualizados."
}: FallbackNoticeProps) => {
  return (
    <div 
      className={cn(
        "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm py-2 px-4 text-center flex items-center justify-center gap-2",
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
