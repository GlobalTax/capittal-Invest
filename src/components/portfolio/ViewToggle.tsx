import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  value: 'grid' | 'list';
  onChange: (value: 'grid' | 'list') => void;
}

export const ViewToggle = ({ value, onChange }: ViewToggleProps) => {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          'rounded-r-none',
          value === 'grid' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
        onClick={() => onChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          'rounded-l-none border-l-0',
          value === 'list' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
        onClick={() => onChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
