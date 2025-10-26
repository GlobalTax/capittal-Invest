interface LogoGridProps {
  logos: Array<{ name: string; src?: string }>;
  className?: string;
}

export const LogoGrid = ({ logos, className = "" }: LogoGridProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${className}`}>
      {logos.map((logo, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center p-8 border border-border rounded-lg hover-lift hover:border-accent transition-smooth grayscale opacity-80 hover:opacity-100 hover:grayscale-0"
        >
          <span className="text-sm font-medium text-body">{logo.name}</span>
        </div>
      ))}
    </div>
  );
};
