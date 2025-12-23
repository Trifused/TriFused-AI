import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ContactFormDialogProps {
  trigger?: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  defaultMessage?: string;
  onOpenChange?: (open: boolean) => void;
}

export function ContactFormDialog({ trigger, className, defaultOpen = false, defaultMessage = "", onOpenChange }: ContactFormDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: defaultMessage
  });
  
  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);
  
  useEffect(() => {
    if (defaultMessage) {
      setFormData(prev => ({ ...prev, message: defaultMessage }));
    }
  }, [defaultMessage]);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully! We'll be in touch soon.");
        setFormData({ name: "", email: "", company: "", message: "" });
        handleOpenChange(false);
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button 
            className={className || "bg-black text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-2xl"}
            data-testid="button-open-contact"
          >
            Schedule Consultation
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black/95 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold">
            Let's <span className="text-primary">Connect</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us about your project and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-mono text-white/80">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-mono text-white/80">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-mono text-white/80">
              Company
            </Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your organization (optional)"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
              data-testid="input-company"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-mono text-white/80">
              Message *
            </Label>
            <textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your needs..."
              rows={4}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              data-testid="input-message"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-white/10 hover:bg-white/5"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
              data-testid="button-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
