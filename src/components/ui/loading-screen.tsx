import { Loader } from "./loader";
import { cn } from "@/lib/utils";
import { TEXT } from "@/constants/text";

interface LoadingScreenProps {
  message?: string;
  className?: string;
  variant?: "spinner" | "pulse" | "dots";
  size?: "sm" | "md" | "lg";
}

const LoadingScreen = ({ 
  message = TEXT.LOADING.default, 
  className,
  variant = "spinner",
  size = "md"
}: LoadingScreenProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 text-center space-y-4",
      className
    )}>
      <Loader variant={variant} size={size} />
      {message && (
        <p className="text-muted-foreground font-greta text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export { LoadingScreen };