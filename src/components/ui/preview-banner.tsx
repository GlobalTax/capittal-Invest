import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PreviewBannerProps {
  expiresAt: string;
  accessedCount?: number;
}

export const PreviewBanner = ({ expiresAt, accessedCount }: PreviewBannerProps) => {
  const expiryDate = new Date(expiresAt);
  const timeUntilExpiry = formatDistanceToNow(expiryDate, { addSuffix: true });

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
      <div className="container mx-auto flex items-center gap-3 flex-wrap">
        <Eye className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
          Preview Mode - This content is not published yet
        </span>
        <span className="text-xs text-amber-700 dark:text-amber-400">
          Expires {timeUntilExpiry}
        </span>
        {accessedCount !== undefined && (
          <span className="text-xs text-amber-600 dark:text-amber-500">
            Viewed {accessedCount} {accessedCount === 1 ? 'time' : 'times'}
          </span>
        )}
      </div>
    </div>
  );
};
