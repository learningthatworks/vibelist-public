import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { ContactDialog } from "@/components/ContactDialog";
import { AboutDialog } from "@/components/AboutDialog";
import { SubmitProductDialog } from "@/components/SubmitProductDialog";
import { SEOHead } from "@/components/SEOHead";
import { generateWebsiteStructuredData } from "@/utils/seo";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Product = {
  id: number;
  name: string;
  slug: string;
  category_type: string;
  db_fit: string;
  first_class_neon: boolean;
  first_class_supabase: boolean;
  byo_postgres: boolean;
  deploy_path: string | null;
  oss: boolean;
  pricing_model: string | null;
  ai_builder: boolean;
  designer_first: boolean;
  enterprise_ready: boolean;
  tags: string | null;
  avg_rating: number;
  vote_count: number;
  overview_short: string | null;
  pros_short: string | null;
  cons_short: string | null;
  complexity_hint: number | null;
  difficulty_hint: number | null;
  use_case_category: string | null;
  created_at: string | null;
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"avg_rating" | "vote_count" | "name" | "score">("score");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dbFitFilter, setDbFitFilter] = useState<string>("all");
  const [deployPathFilter, setDeployPathFilter] = useState<string[]>([]);
  const [pricingModelFilter, setPricingModelFilter] = useState<string>("all");
  const [useCaseCategoryFilter, setUseCaseCategoryFilter] = useState<string>("all");
  const [ossFilter, setOssFilter] = useState<boolean | null>(null);
  const [enterpriseReadyFilter, setEnterpriseReadyFilter] = useState<boolean | null>(null);
  const [firstClassNeonFilter, setFirstClassNeonFilter] = useState<boolean | null>(null);
  const [firstClassSupabaseFilter, setFirstClassSupabaseFilter] = useState<boolean | null>(null);
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([0, 5]);
  const [complexityRange, setComplexityRange] = useState<[number, number]>([0, 5]);

  useEffect(() => {
    fetchProducts();
    fetchTotalCount();
  }, [
    sortBy,
    categoryFilter,
    dbFitFilter,
    deployPathFilter,
    pricingModelFilter,
    useCaseCategoryFilter,
    ossFilter,
    enterpriseReadyFilter,
    firstClassNeonFilter,
    firstClassSupabaseFilter,
    difficultyRange,
    complexityRange,
  ]);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching total count:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Use product_scores view for "Recommended" sort, otherwise use products table
      let query: any;
      if (sortBy === "score") {
        query = supabase.from("product_scores").select("*").limit(1000);
      } else {
        query = supabase.from("products").select("*").limit(1000);
      }

      // Apply sorting
      if (sortBy === "score") {
        query = query.order("score", { ascending: false });
      } else {
        query = query.order(sortBy, { ascending: sortBy === "name" ? true : false });
      }

      // Apply filters
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category_type", categoryFilter);
      }
      if (dbFitFilter && dbFitFilter !== "all") {
        query = query.eq("db_fit", dbFitFilter);
      }
      if (deployPathFilter.length > 0) {
        query = query.or(deployPathFilter.map((path) => `deploy_path.ilike.%${path}%`).join(","));
      }
      if (pricingModelFilter && pricingModelFilter !== "all") {
        query = query.eq("pricing_model", pricingModelFilter);
      }
      if (useCaseCategoryFilter && useCaseCategoryFilter !== "all") {
        query = query.eq("use_case_category", useCaseCategoryFilter);
      }
      if (ossFilter !== null) {
        query = query.eq("oss", ossFilter);
      }
      if (enterpriseReadyFilter !== null) {
        query = query.eq("enterprise_ready", enterpriseReadyFilter);
      }
      if (firstClassNeonFilter !== null) {
        query = query.eq("first_class_neon", firstClassNeonFilter);
      }
      if (firstClassSupabaseFilter !== null) {
        query = query.eq("first_class_supabase", firstClassSupabaseFilter);
      }
      if (difficultyRange[0] > 0 || difficultyRange[1] < 5) {
        query = query.gte("difficulty_hint", difficultyRange[0]).lte("difficulty_hint", difficultyRange[1]);
      }
      if (complexityRange[0] > 0 || complexityRange[1] < 5) {
        query = query.gte("complexity_hint", complexityRange[0]).lte("complexity_hint", complexityRange[1]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with overview_short from products if missing (product_scores may not include it)
      if (sortBy === "score") {
        let items = (data as any[]) || [];
        const missingDescIds = items
          .filter((p) => p.overview_short == null)
          .map((p) => p.id)
          .filter((id) => typeof id === "number");

        if (missingDescIds.length > 0) {
          const { data: descs, error: descErr } = await supabase
            .from("products")
            .select("id, overview_short")
            .in("id", missingDescIds);
          if (!descErr && descs) {
            const descMap = new Map(descs.map((d: any) => [d.id, d.overview_short]));
            items = items.map((p) => ({
              ...p,
              overview_short: p.overview_short ?? descMap.get(p.id) ?? null,
            }));
          }
        }
        setProducts(items as Product[]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.tags?.toLowerCase().includes(query) ||
      product.overview_short?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <SEOHead
        title="VibeList - AI Coding Tools Directory | Compare 100+ Dev Platforms"
        description={`Discover and compare ${totalCount}+ AI-powered development tools, no-code builders, and vibecoding platforms. Find the perfect tool for your project with community ratings and detailed comparisons.`}
        keywords="vibecoding, AI coding tools, no-code platforms, app builders, AI development, low-code, Supabase, Neon, React builders, AI agents, development tools, code generators"
        structuredData={generateWebsiteStructuredData(products)}
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  VibeList
                </h1>
                <p className="text-xs text-muted-foreground mt-1">The vibecoding directory by metability.ai</p>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xl sm:text-2xl font-bold text-primary">{totalCount}</span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">apps</span>
              </div>
            </div>
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <nav className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <SubmitProductDialog />
              <AboutDialog />
              <ContactDialog />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8" role="main">
        <ProductFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          dbFitFilter={dbFitFilter}
          onDbFitChange={setDbFitFilter}
          deployPathFilter={deployPathFilter}
          onDeployPathChange={setDeployPathFilter}
          pricingModelFilter={pricingModelFilter}
          onPricingModelChange={setPricingModelFilter}
          useCaseCategoryFilter={useCaseCategoryFilter}
          onUseCaseCategoryChange={setUseCaseCategoryFilter}
          ossFilter={ossFilter}
          onOssChange={setOssFilter}
          enterpriseReadyFilter={enterpriseReadyFilter}
          onEnterpriseReadyChange={setEnterpriseReadyFilter}
          firstClassNeonFilter={firstClassNeonFilter}
          onFirstClassNeonChange={setFirstClassNeonFilter}
          firstClassSupabaseFilter={firstClassSupabaseFilter}
          onFirstClassSupabaseChange={setFirstClassSupabaseFilter}
          difficultyRange={difficultyRange}
          onDifficultyRangeChange={setDifficultyRange}
          complexityRange={complexityRange}
          onComplexityRangeChange={setComplexityRange}
          filteredCount={filteredProducts.length}
          totalCount={totalCount}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ||
            categoryFilter !== "all" ||
            dbFitFilter !== "all" ||
            deployPathFilter.length > 0 ||
            pricingModelFilter !== "all" ||
            useCaseCategoryFilter !== "all" ||
            ossFilter !== null ||
            enterpriseReadyFilter !== null ||
            firstClassNeonFilter !== null ||
            firstClassSupabaseFilter !== null ? (
              <p className="text-muted-foreground">No products found with the selected filters.</p>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-muted-foreground">No products in the database yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default Index;
