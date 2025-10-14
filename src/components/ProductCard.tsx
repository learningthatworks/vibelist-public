import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyComplexityBadge } from "@/components/DifficultyComplexityBadge";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

type Product = {
  id: number;
  name: string;
  slug: string;
  category_type: string;
  db_fit: string;
  first_class_neon: boolean;
  first_class_supabase: boolean;
  oss: boolean;
  avg_rating: number;
  vote_count: number;
  tags: string | null;
  overview_short: string | null;
  difficulty_hint?: number;
  complexity_hint?: number;
  url?: string | null;
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const tags = product.tags?.split(";").map(tag => tag.trim()).filter(tag => tag.length > 0) || [];

  return (
    <Link to={`/p/${product.slug}`}>
      <Card className="h-full hover:shadow-hover transition-all duration-300 group cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Star className="w-4 h-4 fill-primary" />
              {product.avg_rating > 0 ? product.avg_rating.toFixed(1) : "—"}
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {product.overview_short || "No description available"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {product.first_class_supabase && (
              <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                Supabase
              </Badge>
            )}
            {product.first_class_neon && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Neon
              </Badge>
            )}
            {product.oss && (
              <Badge variant="outline">OSS</Badge>
            )}
            <Badge variant="outline">{product.category_type}</Badge>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{product.avg_rating > 0 ? product.avg_rating.toFixed(1) : "—"}</span>
              </div>
              <div>
                <span>{product.vote_count} {product.vote_count === 1 ? "vote" : "votes"}</span>
              </div>
            </div>
            <DifficultyComplexityBadge 
              difficulty={product.difficulty_hint} 
              complexity={product.complexity_hint}
              variant="compact"
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Details
          </Button>
          {product.url && (
            <Button
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                window.open(product.url!, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1"
            >
              Visit App
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
