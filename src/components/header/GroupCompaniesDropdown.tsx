import { Building2, ChevronDown, ExternalLink, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupCompany } from "@/hooks/useTopBarConfig";

interface GroupCompaniesDropdownProps {
  companies: GroupCompany[];
}

export const GroupCompaniesDropdown = ({ companies }: GroupCompaniesDropdownProps) => {
  const currentCompany = companies.find((c) => c.is_current);
  const otherCompanies = companies.filter((c) => !c.is_current);

  if (companies.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium focus:outline-none">
        <Building2 className="h-4 w-4" />
        <span>{currentCompany?.name || "Grupo"}</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="bg-slate-800 border-slate-700 min-w-[200px]"
      >
        {currentCompany && (
          <DropdownMenuItem 
            disabled 
            className="text-white/90 focus:bg-slate-700 focus:text-white cursor-default"
          >
            <Check className="h-4 w-4 mr-2 text-emerald-400" />
            {currentCompany.name}
          </DropdownMenuItem>
        )}
        {otherCompanies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            asChild
            className="text-white/70 hover:text-white focus:bg-slate-700 focus:text-white cursor-pointer"
          >
            <a 
              href={company.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full"
            >
              <span>{company.name}</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
