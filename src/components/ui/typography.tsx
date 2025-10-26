import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OverlineProps {
  children: ReactNode;
  className?: string;
}

export const Overline = ({ children, className = "" }: OverlineProps) => (
  <div className={cn("text-overline", className)}>
    {children}
  </div>
);

interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({ 
  overline, 
  title, 
  description, 
  className = "" 
}: SectionHeaderProps) => (
  <div className={cn("mb-12", className)}>
    {overline && <Overline className="mb-3">{overline}</Overline>}
    <h2 className="mb-4">{title}</h2>
    {description && (
      <p className="text-lead max-w-2xl">{description}</p>
    )}
  </div>
);
