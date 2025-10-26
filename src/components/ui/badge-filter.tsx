import { Badge } from "@/components/ui/badge";

interface BadgeFilterProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const BadgeFilter = ({ label, active, onClick }: BadgeFilterProps) => {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className="cursor-pointer transition-smooth hover:bg-primary hover:text-primary-foreground"
      onClick={onClick}
    >
      {label}
    </Badge>
  );
};
