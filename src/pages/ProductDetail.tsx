import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyComplexityBadge } from "@/components/DifficultyComplexityBadge";
import { SEOHead } from "@/components/SEOHead";
import { generateProductStructuredData, generateBreadcrumbStructuredData } from "@/utils/seo";
import { Loader2, ArrowLeft, Star } from "lucide-react";
import { RatingWidget } from "@/components/RatingWidget";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: number;
  name: string;
  slug: string;
  category_type: string;
  db_fit: string;
  first_class_neon: boolean;
  first_class_supabase: boolean;
  oss: boolean;
  overview_short: string | null;
  pros_short: string | null;
  cons_short: string | null;
  tags: string | null;
  avg_rating: number;
  vote_count: number;
  deploy_path: string | null;
  pricing_model: string | null;
  difficulty_hint?: number;
  complexity_hint?: number;
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchProduct();
      checkUserRating();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserRating = async () => {
    // Note: Can't check user rating with httpOnly cookies
    // Will be checked server-side on vote attempt
  };

  const handleRate = async (rating: number) => {
    if (!product) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-vote', {
        body: {
          product_id: product.id,
          rating,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: "Already Voted",
          description: data.error,
          variant: "destructive",
        });
        setUserRating(rating);
        return;
      }

      setUserRating(rating);
      
      // Update with server response
      if (data.product_stats) {
        setProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            vote_count: data.product_stats.vote_count,
            avg_rating: data.product_stats.avg_rating,
          };
        });
      }

      toast({
        title: "Rating Submitted",
        description: `You rated ${product.name} ${rating} stars`,
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Product not found</p>
            <Link to="/">
              <Button className="mt-4">Back to Directory</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tags = product.tags?.split(";").map(tag => tag.trim()).filter(tag => tag.length > 0) || [];

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: typeof window !== 'undefined' ? window.location.origin : 'https://vibelist.app' },
    { name: product.name, url: typeof window !== 'undefined' ? window.location.href : `https://vibelist.app/p/${product.slug}` },
  ]);

  return (
    <>
      <SEOHead
        title={`${product.name} - ${product.category_type} | VibeList`}
        description={product.overview_short || `${product.name} - ${product.category_type}. ${product.pros_short || ''}`}
        keywords={`${product.name}, ${product.tags?.split(';').join(', ')}, ${product.category_type}, ${product.db_fit}`}
        structuredData={generateProductStructuredData(product)}
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        type="product"
      />
      <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{product.name}</CardTitle>
                  <p className="text-muted-foreground">{product.category_type}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <Star className="w-6 h-6 fill-primary" />
                    {product.avg_rating > 0 ? product.avg_rating.toFixed(1) : "—"}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.vote_count} {product.vote_count === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {product.first_class_supabase && (
                  <Badge className="bg-gradient-primary text-primary-foreground">
                    Supabase
                  </Badge>
                )}
                {product.first_class_neon && (
                  <Badge className="bg-accent text-accent-foreground">
                    Neon
                  </Badge>
                )}
                {product.oss && <Badge variant="outline">Open Source</Badge>}
                <Badge variant="secondary">{product.db_fit}</Badge>
                {product.deploy_path && (
                  <Badge variant="outline">{product.deploy_path}</Badge>
                )}
                {product.pricing_model && (
                  <Badge variant="outline">{product.pricing_model}</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {product.overview_short && (
                <div>
                  <h3 className="font-semibold mb-2">Overview</h3>
                  <p className="text-muted-foreground">{product.overview_short}</p>
                </div>
              )}

              {(product.difficulty_hint !== undefined || product.complexity_hint !== undefined) && (
                <div>
                  <h3 className="font-semibold mb-3">Skill Level</h3>
                  <DifficultyComplexityBadge 
                    difficulty={product.difficulty_hint} 
                    complexity={product.complexity_hint}
                    variant="detailed"
                  />
                </div>
              )}

              {product.pros_short && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-600">Pros</h3>
                  <p className="text-muted-foreground">{product.pros_short}</p>
                </div>
              )}

              {product.cons_short && (
                <div>
                  <h3 className="font-semibold mb-2 text-orange-600">Cons</h3>
                  <p className="text-muted-foreground">{product.cons_short}</p>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rate this Product</CardTitle>
            </CardHeader>
            <CardContent>
              {userRating ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    You rated this product {userRating} stars
                  </p>
                </div>
              ) : (
                <RatingWidget onRate={handleRate} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  );
};

export default ProductDetail;
