import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filter, X, Sparkles, Database, DollarSign, CloudIcon, Gauge, Boxes, ChevronDown, ChevronUp } from "lucide-react";

// Only show categories with meaningful product counts
const CATEGORIES = [
  "No-code App",
  "Internal Tools",
  "AI Builder",
  "Backend",
  "LLM Builder",
  "Low-code App",
];

// Only show db_fits with products
const DB_FITS = [
  "Postgres",
  "Supabase",
  "Postgres-via-API",
  "Neon",
  "Supabase+Postgres",
];

// Simplified deploy paths that users care about
const DEPLOY_PATHS = [
  "Cloud",
  "Self-host",
  "Vercel",
  "Netlify",
];

// Only pricing models with data
const PRICING_MODELS = [
  { value: "paid", label: "Paid" },
  { value: "oss", label: "Open Source" },
  { value: "freemium", label: "Freemium" },
  { value: "oss+paid", label: "OSS + Paid" },
  { value: "free", label: "Free" },
];

// Use case categories
const USE_CASE_CATEGORIES = [
  "Mobile & Web App Builders",
  "Game Development & Creative Tools",
  "Enterprise & Backend Builders",
  "IDE Plugins & Developer Agents",
  "Multi-Agent & Infrastructure Tools",
];

interface ProductFiltersProps {
  sortBy: "avg_rating" | "vote_count" | "name" | "score";
  onSortChange: (value: "avg_rating" | "vote_count" | "name" | "score") => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dbFitFilter: string;
  onDbFitChange: (value: string) => void;
  deployPathFilter: string[];
  onDeployPathChange: (value: string[]) => void;
  pricingModelFilter: string;
  onPricingModelChange: (value: string) => void;
  useCaseCategoryFilter: string;
  onUseCaseCategoryChange: (value: string) => void;
  ossFilter: boolean | null;
  onOssChange: (value: boolean | null) => void;
  enterpriseReadyFilter: boolean | null;
  onEnterpriseReadyChange: (value: boolean | null) => void;
  firstClassNeonFilter: boolean | null;
  onFirstClassNeonChange: (value: boolean | null) => void;
  firstClassSupabaseFilter: boolean | null;
  onFirstClassSupabaseChange: (value: boolean | null) => void;
  difficultyRange: [number, number];
  onDifficultyRangeChange: (value: [number, number]) => void;
  complexityRange: [number, number];
  onComplexityRangeChange: (value: [number, number]) => void;
  filteredCount?: number;
  totalCount?: number;
}

export function ProductFilters({
  sortBy,
  onSortChange,
  categoryFilter,
  onCategoryChange,
  dbFitFilter,
  onDbFitChange,
  deployPathFilter,
  onDeployPathChange,
  pricingModelFilter,
  onPricingModelChange,
  useCaseCategoryFilter,
  onUseCaseCategoryChange,
  ossFilter,
  onOssChange,
  enterpriseReadyFilter,
  onEnterpriseReadyChange,
  firstClassNeonFilter,
  onFirstClassNeonChange,
  firstClassSupabaseFilter,
  onFirstClassSupabaseChange,
  difficultyRange,
  onDifficultyRangeChange,
  complexityRange,
  onComplexityRangeChange,
  filteredCount = 0,
  totalCount = 0,
}: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = 
    categoryFilter !== "all" || 
    dbFitFilter !== "all" || 
    deployPathFilter.length > 0 ||
    pricingModelFilter !== "all" ||
    useCaseCategoryFilter !== "all" ||
    ossFilter !== null || 
    enterpriseReadyFilter !== null ||
    firstClassNeonFilter !== null ||
    firstClassSupabaseFilter !== null ||
    (difficultyRange[0] > 0 || difficultyRange[1] < 5) ||
    (complexityRange[0] > 0 || complexityRange[1] < 5);

  const clearFilters = () => {
    onCategoryChange("all");
    onDbFitChange("all");
    onDeployPathChange([]);
    onPricingModelChange("all");
    onUseCaseCategoryChange("all");
    onOssChange(null);
    onEnterpriseReadyChange(null);
    onFirstClassNeonChange(null);
    onFirstClassSupabaseChange(null);
    onDifficultyRangeChange([0, 5]);
    onComplexityRangeChange([0, 5]);
  };

  const toggleDeployPath = (path: string) => {
    if (deployPathFilter.includes(path)) {
      onDeployPathChange(deployPathFilter.filter(p => p !== path));
    } else {
      onDeployPathChange([...deployPathFilter, path]);
    }
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Header with Sort, Use Case, and Clear */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Filter & Discover</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-primary">{filteredCount}</span>
                <span className="text-sm text-muted-foreground">/ {totalCount} tools</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Sort by</label>
              </div>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full min-h-[48px] text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-base bg-background z-50">
                  <SelectItem value="score" className="min-h-[44px]">✨ Recommended</SelectItem>
                  <SelectItem value="avg_rating" className="min-h-[44px]">⭐ Highest Rated</SelectItem>
                  <SelectItem value="vote_count" className="min-h-[44px]">🔥 Most Voted</SelectItem>
                  <SelectItem value="name" className="min-h-[44px]">🔤 Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Use Case Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <label className="text-sm font-medium">Use Case</label>
              </div>
              <Select value={useCaseCategoryFilter} onValueChange={onUseCaseCategoryChange}>
                <SelectTrigger className="w-full min-h-[48px] text-base">
                  <SelectValue placeholder="All use cases" />
                </SelectTrigger>
                <SelectContent className="text-base bg-background z-50">
                  <SelectItem value="all" className="min-h-[44px]">All use cases</SelectItem>
                  {USE_CASE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="min-h-[44px]">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            Advanced Filters
            {hasActiveFilters && !showAdvanced && (
              <Badge variant="secondary" className="ml-2">Active</Badge>
            )}
          </Button>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Advanced Filters - Hidden by default */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Boxes className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold">Category</label>
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Database */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold">Database</label>
          </div>
          <Select value={dbFitFilter} onValueChange={onDbFitChange}>
            <SelectTrigger>
              <SelectValue placeholder="All databases" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All databases</SelectItem>
              {DB_FITS.map((db) => (
                <SelectItem key={db} value={db}>{db}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Pricing */}
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold">Pricing</label>
          </div>
          <Select value={pricingModelFilter} onValueChange={onPricingModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="All pricing" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All pricing</SelectItem>
              {PRICING_MODELS.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Deploy Path - Badge Selection */}
        <Card className="p-4 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <CloudIcon className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold">Deployment</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEPLOY_PATHS.map((path) => (
              <Badge
                key={path}
                variant={deployPathFilter.includes(path) ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform px-4 py-2 text-sm"
                onClick={() => toggleDeployPath(path)}
              >
                {path}
                {deployPathFilter.includes(path) && (
                  <X className="w-3 h-3 ml-2" />
                )}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Skill Level Filters */}
        <Card className="p-4 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-primary" />
            <label className="text-sm font-semibold">Skill Level</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">Difficulty</span>
                <Badge variant="secondary" className="text-xs">
                  {difficultyRange[0] === 0 && difficultyRange[1] === 5 
                    ? "All levels" 
                    : `${difficultyRange[0]} - ${difficultyRange[1]}`}
                </Badge>
              </div>
              <Slider
                min={0}
                max={5}
                step={1}
                value={difficultyRange}
                onValueChange={(value) => onDifficultyRangeChange(value as [number, number])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">Complexity</span>
                <Badge variant="secondary" className="text-xs">
                  {complexityRange[0] === 0 && complexityRange[1] === 5 
                    ? "All levels" 
                    : `${complexityRange[0]} - ${complexityRange[1]}`}
                </Badge>
              </div>
              <Slider
                min={0}
                max={5}
                step={1}
                value={complexityRange}
                onValueChange={(value) => onComplexityRangeChange(value as [number, number])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Simple</span>
                <span>Advanced</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Filters - Toggle Badges */}
        <Card className="p-4 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
          <label className="text-sm font-semibold mb-3 block">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={ossFilter === true ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform px-4 py-2"
              onClick={() => onOssChange(ossFilter === true ? null : true)}
            >
              Open Source
            </Badge>
            <Badge
              variant={enterpriseReadyFilter === true ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform px-4 py-2"
              onClick={() => onEnterpriseReadyChange(enterpriseReadyFilter === true ? null : true)}
            >
              Enterprise Ready
            </Badge>
            <Badge
              variant={firstClassSupabaseFilter === true ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform px-4 py-2 bg-gradient-primary"
              onClick={() => onFirstClassSupabaseChange(firstClassSupabaseFilter === true ? null : true)}
            >
              Supabase First-Class
            </Badge>
            <Badge
              variant={firstClassNeonFilter === true ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform px-4 py-2"
              onClick={() => onFirstClassNeonChange(firstClassNeonFilter === true ? null : true)}
            >
              Neon First-Class
            </Badge>
          </div>
        </Card>
        </div>
      )}
    </div>
  );
}
