interface LogoGridProps {
  logos: Array<{ name: string; src?: string }>;
  className?: string;
}

export const LogoGrid = ({ logos, className = "" }: LogoGridProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ${className}`}>
      {logos.map((logo, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center p-6 bg-secondary rounded-lg hover:bg-muted transition-smooth"
        >
          <span className="text-sm font-medium text-body">{logo.name}</span>
        </div>
      ))}
    </div>
  );
};
