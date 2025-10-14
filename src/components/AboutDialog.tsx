import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          <Info className="w-4 h-4 mr-2" />
          About
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            About VibeApps Directory
          </DialogTitle>
          <DialogDescription className="text-left space-y-4 pt-4">
            <p className="text-base text-foreground">
              VibeApps Directory is a curated collection of tools and platforms 
              for building modern applications with PostgreSQL databases, 
              particularly Supabase and Neon.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">What We Offer</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Comprehensive directory of development tools</li>
                <li>Ratings and reviews from the community</li>
                <li>Advanced filtering by database compatibility, pricing, and more</li>
                <li>Difficulty and complexity indicators for each tool</li>
                <li>Curated recommendations based on sophisticated ranking</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Our Mission</h4>
              <p className="text-sm text-muted-foreground">
                We help developers discover the perfect tools for their projects, 
                whether you're building AI applications, internal tools, or full-stack apps. 
                Our community-driven platform ensures you have access to up-to-date 
                information and real user experiences.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Get Involved</h4>
              <p className="text-sm text-muted-foreground">
                Rate the tools you've used, submit new products to our directory, 
                or help us improve existing listings. Together, we're building the 
                most comprehensive resource for modern app development.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
