interface StatProps {
  label: string;
  value: string;
  className?: string;
}

export const Stat = ({ label, value, className = "" }: StatProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <dt className="text-4xl md:text-5xl font-serif font-medium text-foreground">{value}</dt>
      <dd className="text-sm text-body uppercase tracking-wider">{label}</dd>
    </div>
  );
};
