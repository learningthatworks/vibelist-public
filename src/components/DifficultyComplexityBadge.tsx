import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DifficultyComplexityBadgeProps {
  difficulty?: number;
  complexity?: number;
  variant?: "compact" | "detailed";
  className?: string;
}

const getLabel = (value: number, type: "difficulty" | "complexity"): string => {
  if (type === "difficulty") {
    if (value <= 1) return "Beginner";
    if (value <= 2) return "Easy";
    if (value <= 3) return "Moderate";
    if (value <= 4) return "Advanced";
    return "Expert";
  } else {
    if (value <= 1) return "Simple";
    if (value <= 2) return "Basic";
    if (value <= 3) return "Moderate";
    if (value <= 4) return "Complex";
    return "Advanced";
  }
};

const getColorClass = (value: number): string => {
  if (value <= 1) return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
  if (value <= 3) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
};

const renderStars = (value: number): string => {
  const filled = "★".repeat(value);
  const empty = "☆".repeat(5 - value);
  return filled + empty;
};

export function DifficultyComplexityBadge({
  difficulty,
  complexity,
  variant = "compact",
  className,
}: DifficultyComplexityBadgeProps) {
  if (difficulty === undefined && complexity === undefined) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex gap-2 items-center text-xs", className)}>
        {difficulty !== undefined && difficulty > 0 && (
          <Badge variant="outline" className={cn("font-normal", getColorClass(difficulty))}>
            {getLabel(difficulty, "difficulty")}
          </Badge>
        )}
        {complexity !== undefined && complexity > 0 && (
          <Badge variant="outline" className={cn("font-normal", getColorClass(complexity))}>
            {getLabel(complexity, "complexity")}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {difficulty !== undefined && difficulty > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Difficulty</span>
            <Badge variant="outline" className={cn("font-normal", getColorClass(difficulty))}>
              {getLabel(difficulty, "difficulty")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-lg text-muted-foreground">{renderStars(difficulty)}</div>
            <span className="text-xs text-muted-foreground">({difficulty}/5)</span>
          </div>
        </div>
      )}
      {complexity !== undefined && complexity > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Complexity</span>
            <Badge variant="outline" className={cn("font-normal", getColorClass(complexity))}>
              {getLabel(complexity, "complexity")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-lg text-muted-foreground">{renderStars(complexity)}</div>
            <span className="text-xs text-muted-foreground">({complexity}/5)</span>
          </div>
        </div>
      )}
    </div>
  );
}
