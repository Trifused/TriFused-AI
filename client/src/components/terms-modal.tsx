import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CURRENT_TERMS_VERSION = "1.0";

interface TermsModalProps {
  isOpen: boolean;
  userTermsVersion?: string | null;
}

export function TermsModal({ isOpen, userTermsVersion }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ version: CURRENT_TERMS_VERSION }),
      });
      if (!res.ok) throw new Error("Failed to accept terms");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Terms accepted", description: "Thank you for accepting our terms and conditions." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record your acceptance. Please try again.", variant: "destructive" });
    },
  });

  const needsAcceptance = !userTermsVersion || userTermsVersion !== CURRENT_TERMS_VERSION;

  if (!needsAcceptance) return null;

  return (
    <Dialog open={isOpen && needsAcceptance}>
      <DialogContent 
        className="max-w-2xl bg-slate-900 border-white/10" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-cyan-400" />
            Terms and Conditions
          </DialogTitle>
          <DialogDescription>
            Please review and accept our terms to continue using the portal.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4 mt-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing and using TriFused services ("Services"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you should not use our Services.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">2. Description of Services</h3>
              <p>
                TriFused provides AI-native technology services including but not limited to website grading tools, compliance scanning, API access, and data management solutions. We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">3. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">4. Acceptable Use</h3>
              <p>
                You agree to use the Services only for lawful purposes and in accordance with these Terms. You may not use the Services to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful or malicious content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Services</li>
              </ul>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">5. Data Collection and Privacy</h3>
              <p>
                We collect and process personal data in accordance with our Privacy Policy. By using our Services, you consent to such collection and processing. Website scans and reports may be stored for service improvement and analytics purposes.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">6. Intellectual Property</h3>
              <p>
                All content, features, and functionality of the Services are owned by TriFused and are protected by intellectual property laws. You may not copy, modify, or distribute any part of our Services without prior written consent.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">7. Payment Terms</h3>
              <p>
                Paid services are billed according to the pricing displayed at the time of purchase. Subscriptions auto-renew unless cancelled. Refunds are provided in accordance with our refund policy.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">8. Limitation of Liability</h3>
              <p>
                TriFused shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Services. Our total liability shall not exceed the amount paid by you for the Services in the preceding twelve months.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">9. Indemnification</h3>
              <p>
                You agree to indemnify and hold harmless TriFused and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">10. Modifications to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be communicated via email or through the Services. Continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">11. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-2">12. Contact Information</h3>
              <p>
                For questions about these Terms, please contact us through the contact form on our website or email support@trifused.com.
              </p>
            </section>

            <p className="text-xs text-muted-foreground pt-4 border-t border-white/10">
              Terms Version: {CURRENT_TERMS_VERSION} | Last Updated: December 2024
            </p>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              data-testid="checkbox-accept-terms"
            />
            <label
              htmlFor="accept-terms"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I have read and agree to the Terms and Conditions
            </label>
          </div>
          <Button
            onClick={() => acceptTermsMutation.mutate()}
            disabled={!accepted || acceptTermsMutation.isPending}
            className="bg-cyan-500 hover:bg-cyan-600 text-black"
            data-testid="btn-accept-terms"
          >
            {acceptTermsMutation.isPending ? "Accepting..." : "Accept and Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CURRENT_TERMS_VERSION };
