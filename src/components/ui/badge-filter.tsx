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
      className="cursor-pointer transition-all duration-150 ease-out hover:scale-105 active:scale-95 select-none"
      onClick={onClick}
    >
      {label}
    </Badge>
  );
};
