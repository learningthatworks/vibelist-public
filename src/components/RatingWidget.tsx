import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingWidgetProps {
  onRate: (rating: number) => void;
}

export function RatingWidget({ onRate }: RatingWidgetProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleClick = (rating: number) => {
    setSelectedRating(rating);
    onRate(rating);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            className="transition-transform hover:scale-110"
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleClick(rating)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                rating <= (hoveredRating || selectedRating)
                  ? "fill-primary text-primary"
                  : "text-muted"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {hoveredRating > 0
          ? `Rate ${hoveredRating} star${hoveredRating > 1 ? "s" : ""}`
          : "Click a star to rate"}
      </p>
    </div>
  );
}
