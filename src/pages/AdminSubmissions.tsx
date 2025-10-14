import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

type Submission = {
  id: number;
  name: string;
  url: string | null;
  category_type: string;
  db_fit: string;
  deploy_path: string | null;
  pricing_model: string | null;
  oss: boolean;
  ai_builder: boolean;
  designer_first: boolean;
  enterprise_ready: boolean;
  first_class_neon: boolean;
  first_class_supabase: boolean;
  byo_postgres: boolean;
  tags: string | null;
  overview_short: string | null;
  pros_short: string | null;
  cons_short: string | null;
  complexity_hint: number | null;
  difficulty_hint: number | null;
  submitter_email: string | null;
  submitter_notes: string | null;
  status: string;
  created_at: string;
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("product_submissions")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (submission: Submission) => {
    try {
      // Create slug from name
      const slug = submission.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Get the max ID to generate next ID
      const { data: maxData } = await supabase
        .from("products")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      const nextId = maxData ? maxData.id + 1 : 1;

      // Insert into products table
      const { error: insertError } = await supabase
        .from("products")
        .insert([
          {
            id: nextId,
            name: submission.name,
            slug,
            url: submission.url,
            category_type: submission.category_type,
            db_fit: submission.db_fit,
            deploy_path: submission.deploy_path,
            pricing_model: submission.pricing_model,
            oss: submission.oss,
            ai_builder: submission.ai_builder,
            designer_first: submission.designer_first,
            enterprise_ready: submission.enterprise_ready,
            first_class_neon: submission.first_class_neon,
            first_class_supabase: submission.first_class_supabase,
            byo_postgres: submission.byo_postgres,
            tags: submission.tags,
            overview_short: submission.overview_short,
            pros_short: submission.pros_short,
            cons_short: submission.cons_short,
            complexity_hint: submission.complexity_hint || 0,
            difficulty_hint: submission.difficulty_hint || 0,
          },
        ]);

      if (insertError) throw insertError;

      // Update submission status
      const { error: updateError } = await supabase
        .from("product_submissions")
        .update({ status: "approved" })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      toast({
        title: "Approved!",
        description: `${submission.name} has been added to the products list.`,
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve submission.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from("product_submissions")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: `${name} has been rejected.`,
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Review App Submissions</h1>
        <p className="text-muted-foreground">
          {submissions.length} pending {submissions.length === 1 ? "submission" : "submissions"}
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending submissions
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {submission.name}
                      {submission.url && (
                        <a
                          href={submission.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Submitted {new Date(submission.created_at).toLocaleDateString()}
                      {submission.submitter_email && ` by ${submission.submitter_email}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(submission)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(submission.id, submission.name)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{submission.category_type}</Badge>
                  <Badge variant="outline">{submission.db_fit}</Badge>
                  {submission.pricing_model && (
                    <Badge variant="secondary">{submission.pricing_model}</Badge>
                  )}
                  {submission.oss && <Badge>OSS</Badge>}
                  {submission.ai_builder && <Badge>AI Builder</Badge>}
                  {submission.designer_first && <Badge>Designer First</Badge>}
                  {submission.enterprise_ready && <Badge>Enterprise</Badge>}
                  {submission.first_class_neon && <Badge>Neon</Badge>}
                  {submission.first_class_supabase && <Badge>Supabase</Badge>}
                </div>

                {submission.overview_short && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Overview</h4>
                    <p className="text-sm text-muted-foreground">{submission.overview_short}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {submission.pros_short && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-green-600">Pros</h4>
                      <p className="text-sm text-muted-foreground">{submission.pros_short}</p>
                    </div>
                  )}
                  {submission.cons_short && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-destructive">Cons</h4>
                      <p className="text-sm text-muted-foreground">{submission.cons_short}</p>
                    </div>
                  )}
                </div>

                {submission.tags && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Tags</h4>
                    <p className="text-sm text-muted-foreground">{submission.tags}</p>
                  </div>
                )}

                {submission.submitter_notes && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Submitter Notes</h4>
                    <p className="text-sm text-muted-foreground">{submission.submitter_notes}</p>
                  </div>
                )}

                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Difficulty: {submission.difficulty_hint || 0}/5</span>
                  <span>Complexity: {submission.complexity_hint || 0}/5</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
