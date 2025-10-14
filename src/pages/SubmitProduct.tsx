import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["App Builder", "Lowcode", "Fullstack", "AI/ML Tools"];
const DB_FITS = ["Postgres", "NoSQL", "Multi-DB", "Any"];
const PRICING_MODELS = ["Free", "Freemium", "Paid", "Open Source"];

export default function SubmitProduct() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const captchaRef = useRef<HCaptcha>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category_type: "",
    db_fit: "",
    deploy_path: "",
    pricing_model: "",
    oss: false,
    ai_builder: false,
    designer_first: false,
    enterprise_ready: false,
    first_class_neon: false,
    first_class_supabase: false,
    byo_postgres: true,
    tags: "",
    overview_short: "",
    pros_short: "",
    cons_short: "",
    complexity_hint: 3,
    difficulty_hint: 3,
    submitter_email: "",
    submitter_notes: "",
  });
  const [duplicateWarning, setDuplicateWarning] = useState<string>("");
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const checkDuplicates = async (name: string) => {
    if (!name || name.length < 3) {
      setDuplicateWarning("");
      return;
    }

    setCheckingDuplicate(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("name")
        .ilike("name", `%${name}%`);

      if (error) throw error;

      if (data && data.length > 0) {
        const exactMatch = data.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (exactMatch) {
          setDuplicateWarning(`⚠️ "${exactMatch.name}" already exists in our database.`);
        } else {
          setDuplicateWarning(`Similar apps found: ${data.map(p => p.name).join(", ")}. Please verify this is a new app.`);
        }
      } else {
        setDuplicateWarning("");
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_type || !formData.db_fit) {
      toast({
        title: "Missing required fields",
        description: "Please fill in Name, Category, and Database Fit.",
        variant: "destructive",
      });
      return;
    }

    if (duplicateWarning.includes("already exists")) {
      toast({
        title: "Duplicate app",
        description: "This app already exists in our database.",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "CAPTCHA required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call edge function with server-side CAPTCHA verification
      const { data, error } = await supabase.functions.invoke('submit-product', {
        body: { ...formData, captcha_token: captchaToken }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to submit product");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Submission successful!",
        description: data?.message || "Thank you! Your app submission will be reviewed by our team.",
      });

      // Reset form
      setFormData({
        name: "",
        url: "",
        category_type: "",
        db_fit: "",
        deploy_path: "",
        pricing_model: "",
        oss: false,
        ai_builder: false,
        designer_first: false,
        enterprise_ready: false,
        first_class_neon: false,
        first_class_supabase: false,
        byo_postgres: true,
        tags: "",
        overview_short: "",
        pros_short: "",
        cons_short: "",
        complexity_hint: 3,
        difficulty_hint: 3,
        submitter_email: "",
        submitter_notes: "",
      });
      
      setCaptchaToken("");
      captchaRef.current?.resetCaptcha();
      setDuplicateWarning("");

      navigate("/");
    } catch (error: any) {
      console.error("Error submitting product:", error);
      
      // Handle specific error messages
      let errorMessage = "Please try again later.";
      
      if (error.message?.includes("Too many submissions")) {
        errorMessage = "Too many submissions. Please try again in an hour.";
      } else if (error.message?.includes("CAPTCHA")) {
        errorMessage = "CAPTCHA verification failed. Please try again.";
      } else if (error.message?.includes("duplicate") || error.message?.includes("already been submitted")) {
        errorMessage = "A product with this name has already been submitted.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Submit a New App</h1>
            <p className="text-lg text-muted-foreground">
              Submit an app to be added to VibeList. Your submission will be reviewed by our team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 touch-manipulation" aria-label="New app submission form">
            {/* Basic Information */}
            <div className="space-y-4 bg-card p-6 rounded-lg border">
              <h2 className="font-semibold text-xl">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">App Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    checkDuplicates(e.target.value);
                  }}
                  placeholder="e.g., Lovable"
                  required
                  maxLength={200}
                  className="text-base min-h-[48px]"
                  aria-required="true"
                  aria-describedby={duplicateWarning ? "duplicate-warning" : undefined}
                />
                {checkingDuplicate && (
                  <p className="text-sm text-muted-foreground mt-1" role="status" aria-live="polite">
                    Checking for duplicates...
                  </p>
                )}
                {duplicateWarning && (
                  <p id="duplicate-warning" className="text-sm text-destructive mt-1" role="alert">
                    {duplicateWarning}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-base">App URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  required
                  maxLength={500}
                  className="text-base min-h-[48px]"
                  aria-required="true"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="category" className="text-base">Category *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="p-2 rounded-full hover:bg-muted min-w-[32px] min-h-[32px]" aria-label="Help for Category field">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-base p-4">
                          <p>Choose the type of tool: App Builder (visual tools), Lowcode (minimal coding), Fullstack (complete development), or AI/ML Tools (AI-powered features)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={formData.category_type} onValueChange={(value) => setFormData({ ...formData, category_type: value })}>
                    <SelectTrigger className="min-h-[48px] text-base" aria-required="true">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="min-h-[44px] text-base">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="db_fit" className="text-base">Database Fit *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="p-2 rounded-full hover:bg-muted min-w-[32px] min-h-[32px]" aria-label="Help for Database Fit field">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-base p-4">
                          <p>Which database technology works best: Postgres (PostgreSQL), NoSQL (MongoDB, etc.), Multi-DB (supports multiple types), or Any (database-agnostic)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={formData.db_fit} onValueChange={(value) => setFormData({ ...formData, db_fit: value })}>
                    <SelectTrigger className="min-h-[48px] text-base" aria-required="true">
                      <SelectValue placeholder="Select database" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      {DB_FITS.map((db) => (
                        <SelectItem key={db} value={db} className="min-h-[44px] text-base">{db}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pricing" className="text-base">Pricing Model</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="p-2 rounded-full hover:bg-muted min-w-[32px] min-h-[32px]" aria-label="Help for Pricing Model field">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-base p-4">
                          <p>How the app is priced: Free (no cost), Freemium (free with paid upgrades), Paid (subscription/one-time payment), or Open Source (free code you can host yourself)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={formData.pricing_model} onValueChange={(value) => setFormData({ ...formData, pricing_model: value })}>
                    <SelectTrigger className="min-h-[48px] text-base">
                      <SelectValue placeholder="Select pricing" />
                    </SelectTrigger>
                    <SelectContent className="text-base">
                      {PRICING_MODELS.map((pm) => (
                        <SelectItem key={pm} value={pm} className="min-h-[44px] text-base">{pm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="deploy_path" className="text-base">Deploy Path</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="p-2 rounded-full hover:bg-muted min-w-[32px] min-h-[32px]" aria-label="Help for Deploy Path field">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-base p-4">
                          <p>Where you can host/deploy the app (e.g., Vercel, AWS, Netlify, Self-hosted, or Cloud platform name)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="deploy_path"
                    value={formData.deploy_path}
                    onChange={(e) => setFormData({ ...formData, deploy_path: e.target.value })}
                    placeholder="e.g., Vercel, AWS, Self-hosted"
                    maxLength={200}
                    className="text-base min-h-[48px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview" className="text-base">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview_short}
                  onChange={(e) => setFormData({ ...formData, overview_short: e.target.value })}
                  placeholder="Brief overview of the app..."
                  maxLength={500}
                  className="text-base min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pros" className="text-base">Pros</Label>
                  <Textarea
                    id="pros"
                    value={formData.pros_short}
                    onChange={(e) => setFormData({ ...formData, pros_short: e.target.value })}
                    placeholder="What are the strengths?"
                    maxLength={300}
                    className="text-base min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cons" className="text-base">Cons</Label>
                  <Textarea
                    id="cons"
                    value={formData.cons_short}
                    onChange={(e) => setFormData({ ...formData, cons_short: e.target.value })}
                    placeholder="Any limitations?"
                    maxLength={300}
                    className="text-base min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-base">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., AI, React, TypeScript"
                  maxLength={200}
                  className="text-base min-h-[48px]"
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 bg-card p-6 rounded-lg border">
              <h2 className="font-semibold text-xl">Features</h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "oss", label: "Open Source", help: "Code is publicly available and can be modified by anyone", field: "oss" },
                  { id: "ai_builder", label: "AI Builder", help: "Uses AI to help you build apps faster (like chatbots or AI-assisted coding)", field: "ai_builder" },
                  { id: "designer_first", label: "Designer First", help: "Designed for visual creators - drag & drop, no coding needed", field: "designer_first" },
                  { id: "enterprise_ready", label: "Enterprise Ready", help: "Has features large companies need (security, compliance, team management)", field: "enterprise_ready" },
                  { id: "first_class_neon", label: "First-class Neon", help: "Built-in support for Neon database (serverless Postgres)", field: "first_class_neon" },
                  { id: "first_class_supabase", label: "First-class Supabase", help: "Built-in support for Supabase (backend as a service)", field: "first_class_supabase" },
                  { id: "byo_postgres", label: "BYO Postgres", help: "Bring Your Own Postgres - you can use your own PostgreSQL database", field: "byo_postgres" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center gap-3 min-h-[48px] p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={item.id}
                      checked={formData[item.field as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => setFormData({ ...formData, [item.field]: checked as boolean })}
                      className="min-h-[28px] min-w-[28px]"
                    />
                    <Label htmlFor={item.id} className="cursor-pointer text-base flex-1">{item.label}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="p-2 rounded-full hover:bg-muted min-w-[32px] min-h-[32px]" aria-label={`Help for ${item.label}`}>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-base p-4">
                          <p>{item.help}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div className="space-y-4 bg-card p-6 rounded-lg border">
              <h2 className="font-semibold text-xl">Skill Level</h2>
              
              <div className="space-y-3">
                <Label className="text-base">Difficulty (0-5): {formData.difficulty_hint}</Label>
                <Slider
                  value={[formData.difficulty_hint]}
                  onValueChange={([value]) => setFormData({ ...formData, difficulty_hint: value })}
                  max={5}
                  step={1}
                  className="py-4 touch-manipulation"
                  aria-label="Difficulty level from 0 to 5"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base">Complexity (0-5): {formData.complexity_hint}</Label>
                <Slider
                  value={[formData.complexity_hint]}
                  onValueChange={([value]) => setFormData({ ...formData, complexity_hint: value })}
                  max={5}
                  step={1}
                  className="py-4 touch-manipulation"
                  aria-label="Complexity level from 0 to 5"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 bg-card p-6 rounded-lg border">
              <h2 className="font-semibold text-xl">Your Information (Optional)</h2>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email (for updates)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.submitter_email}
                  onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                  placeholder="your@email.com"
                  maxLength={255}
                  className="text-base min-h-[48px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.submitter_notes}
                  onChange={(e) => setFormData({ ...formData, submitter_notes: e.target.value })}
                  placeholder="Any additional information you'd like to share..."
                  maxLength={500}
                  className="text-base min-h-[100px]"
                />
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center py-4">
              <HCaptcha
                ref={captchaRef}
                sitekey="6bd0f2b2-6362-4b26-8eb4-42c8ed3028f2"
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken("")}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
                className="min-h-[48px] text-base w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !captchaToken}
                className="min-h-[48px] text-base w-full sm:w-auto"
              >
                {loading ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
