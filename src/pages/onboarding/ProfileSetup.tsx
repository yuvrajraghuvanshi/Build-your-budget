import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Briefcase, Target } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

const ProfileSetup = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [occupation, setOccupation] = useState("");
  const [financialGoal, setFinancialGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProfileDetails } = useProfile();
  const { user } = useAuth()
  console.log({ user })

  const handleContinue = async () => {
    if (!monthlyIncome || !occupation || !financialGoal) {
      toast({
        title: "Please fill in all fields",
        description: "Complete your profile to get personalized recommendations",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    // Save to database
    const { error } = await updateProfileDetails({
      firstName: user?.user_metadata?.first_name || "",
      lastName: user?.user_metadata?.last_name || "",
      monthlyIncome:parseFloat(monthlyIncome),
      occupation,
      financialGoal
    }
    );

    if (error) {
      toast({
        title: "Error saving profile",
        description: "Please try again",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: "Profile completed!",
      description: "Your information has been saved successfully",
    });

    navigate("/onboarding/welcome-tour");
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₱</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">PennyPinch</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground">
            Help us personalize your experience with some basic information
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Monthly Income */}
            <div className="space-y-2">
              <Label htmlFor="income" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Monthly Income
              </Label>
              <Input
                id="income"
                type="number"
                placeholder="Enter your monthly income"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Occupation
              </Label>
              <Input
                id="occupation"
                type="text"
                placeholder="e.g., Software Engineer, Teacher, Student"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>

            {/* Financial Goal */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Primary Financial Goal
              </Label>
              <Select value={financialGoal} onValueChange={setFinancialGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your main goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="save-money">Save Money</SelectItem>
                  <SelectItem value="reduce-expenses">Reduce Expenses</SelectItem>
                  <SelectItem value="track-spending">Track Spending</SelectItem>
                  <SelectItem value="pay-debt">Pay Off Debt</SelectItem>
                  <SelectItem value="build-emergency">Build Emergency Fund</SelectItem>
                  <SelectItem value="invest">Start Investing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/onboarding/currency")}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;