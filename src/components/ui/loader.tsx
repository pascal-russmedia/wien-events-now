import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "dots";
}

const Loader = ({ className, size = "md", variant = "spinner" }: LoaderProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  if (variant === "spinner") {
    return (
      <div className={cn(
        "relative", 
        sizeClasses[size], 
        className
      )}>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn(
        "rounded-full bg-primary animate-pulse",
        sizeClasses[size],
        className
      )} />
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        <div className={cn("rounded-full bg-primary animate-bounce", sizeClasses[size])} style={{ animationDelay: "0ms" }} />
        <div className={cn("rounded-full bg-primary animate-bounce", sizeClasses[size])} style={{ animationDelay: "150ms" }} />
        <div className={cn("rounded-full bg-primary animate-bounce", sizeClasses[size])} style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  return null;
};

export { Loader };