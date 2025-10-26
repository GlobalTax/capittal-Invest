interface StatProps {
  label: string;
  value: string;
  className?: string;
}

export const Stat = ({ label, value, className = "" }: StatProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <dt className="text-3xl md:text-4xl font-bold text-foreground">{value}</dt>
      <dd className="text-sm text-body">{label}</dd>
    </div>
  );
};
