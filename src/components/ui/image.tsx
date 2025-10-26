import { cn } from "@/lib/utils";

interface ImageProps {
  src: string;
  alt: string;
  ratio?: "3:2" | "16:9" | "1:1";
  className?: string;
}

export const Image = ({ src, alt, ratio = "3:2", className = "" }: ImageProps) => {
  const ratioClass = {
    "3:2": "aspect-[3/2]",
    "16:9": "aspect-video",
    "1:1": "aspect-square",
  }[ratio];
  
  return (
    <div className={cn(ratioClass, "overflow-hidden rounded-lg", className)}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};
