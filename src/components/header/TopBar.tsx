import { Phone } from "lucide-react";
import { useTopBarConfig } from "@/hooks/useTopBarConfig";
import { GroupCompaniesDropdown } from "./GroupCompaniesDropdown";

export const TopBar = () => {
  const { config, companies, isLoading } = useTopBarConfig();

  if (isLoading) return null;

  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 h-10 bg-slate-900 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Group Companies Dropdown */}
          <div className="flex items-center gap-6">
            <GroupCompaniesDropdown companies={companies} />
          </div>

          {/* Right: Phone */}
          <div className="flex items-center gap-4">
            {config?.phone_number && (
              <a
                href={config.phone_link || `tel:${config.phone_number}`}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                <span>{config.phone_number}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
