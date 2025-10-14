import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send } from "lucide-react";

export function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    productName: "",
    requestType: "edit_request",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast({
        title: "CAPTCHA Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: { ...formData, captchaToken },
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We've received your request and will get back to you soon.",
      });

      setFormData({
        name: "",
        email: "",
        productName: "",
        requestType: "edit_request",
        message: "",
      });
      setCaptchaToken("");
      captchaRef.current?.resetCaptcha();
      setOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium">
          <Mail className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Contact Us
          </DialogTitle>
          <DialogDescription>
            Request edits, submit new products, or get in touch with us.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType">Request Type *</Label>
            <Select
              value={formData.requestType}
              onValueChange={(value) => setFormData({ ...formData, requestType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edit_request">Edit Product Information</SelectItem>
                <SelectItem value="new_product">Submit New Product</SelectItem>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="report">Report Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name (if applicable)</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="e.g., Vercel v0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder="Please describe your request..."
              rows={4}
            />
          </div>

          <div className="flex justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey="6bd0f2b2-6362-4b26-8eb4-42c8ed3028f2"
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
            />
          </div>

          <Button type="submit" disabled={loading || !captchaToken} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
