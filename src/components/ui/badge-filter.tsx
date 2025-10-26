import { Badge } from "@/components/ui/badge";

interface BadgeFilterProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const BadgeFilter = ({ label, active, onClick }: BadgeFilterProps) => {
  return (
    <Badge
      variant={active ? "selected" : "default"}
      className="cursor-pointer"
      onClick={onClick}
    >
      {label}
    </Badge>
  );
};
