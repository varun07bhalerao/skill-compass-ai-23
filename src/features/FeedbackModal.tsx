import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  targetRole: string;
}

export const FeedbackModal = ({ open, onOpenChange, userEmail, targetRole }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [usefulness, setUsefulness] = useState("");
  const [roleMatch, setRoleMatch] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const submitFeedback = async () => {
    setIsSubmittingFeedback(true);
    try {
      if (userEmail) {
        // Check if feedback already exists for this user and this role
        const feedbackRef = collection(db, "roadmapFeedback");
        const q = query(
          feedbackRef,
          where("userEmail", "==", userEmail),
          where("targetRole", "==", targetRole)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast.error("You have already submitted feedback for this roadmap!");
          setIsSubmittingFeedback(false);
          return;
        }

        await addDoc(feedbackRef, {
          userEmail,
          targetRole,
          rating,
          usefulness,
          roleMatch,
          suggestion,
          completedAt: new Date().toISOString()
        });
      }
      toast.success("Thank you for your feedback!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Congratulations on finishing your roadmap! 🎉</DialogTitle>
          <DialogDescription>
            We'd love to hear about your experience to improve SkillBridge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">1. How helpful was this career roadmap?</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`focus:outline-none ${rating >= star ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Resources Usefulness */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">2. Were the recommended learning resources useful?</Label>
            <RadioGroup value={usefulness} onValueChange={setUsefulness} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Very useful" id="r1" />
                <Label htmlFor="r1" className="font-normal cursor-pointer">Very useful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Useful" id="r2" />
                <Label htmlFor="r2" className="font-normal cursor-pointer">Useful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Neutral" id="r3" />
                <Label htmlFor="r3" className="font-normal cursor-pointer">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Not useful" id="r4" />
                <Label htmlFor="r4" className="font-normal cursor-pointer">Not useful</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 3. Role Match */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">3. Do the suggested career roles match your interests?</Label>
            <RadioGroup value={roleMatch} onValueChange={setRoleMatch} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id="m1" />
                <Label htmlFor="m1" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Somewhat" id="m2" />
                <Label htmlFor="m2" className="font-normal cursor-pointer">Somewhat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id="m3" />
                <Label htmlFor="m3" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 4. Suggestions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold" htmlFor="suggestions">4. Any suggestions to improve SkillBridge?</Label>
            <Textarea
              id="suggestions"
              placeholder="Tell us what you liked or what could be better..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Skip</Button>
          <Button onClick={submitFeedback} disabled={isSubmittingFeedback || rating === 0 || !usefulness || !roleMatch}>
            {isSubmittingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
