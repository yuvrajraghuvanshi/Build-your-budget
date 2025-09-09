import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, BarChart3, Target, PiggyBank, Bell } from "lucide-react";

const tourSteps = [
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Track Your Expenses",
    description: "Monitor all your spending in one place with automatic categorization and detailed insights.",
    features: ["Real-time tracking", "Smart categories", "Visual charts"]
  },
  {
    icon: <PiggyBank className="h-8 w-8 text-primary" />,
    title: "Set Smart Budgets",
    description: "Create personalized budgets and get alerts when you're close to your limits.",
    features: ["Custom categories", "Progress tracking", "Smart alerts"]
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Achieve Your Goals",
    description: "Set financial goals and track your progress with actionable recommendations.",
    features: ["Goal tracking", "Progress visualization", "AI recommendations"]
  },
  {
    icon: <Bell className="h-8 w-8 text-primary" />,
    title: "Stay Informed",
    description: "Get personalized insights and notifications to help you make better financial decisions.",
    features: ["Smart notifications", "Spending insights", "Monthly reports"]
  }
];

const WelcomeTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/onboarding/first-expense");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate("/onboarding/first-expense");
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">BYB</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Build Your Budget</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Build Your Budget</h2>
          <p className="text-muted-foreground">
            Let's take a quick tour of what you can do
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg">
          <CardContent className="p-8">
            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tour Content */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {currentTourStep.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {currentTourStep.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {currentTourStep.description}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap justify-center gap-2">
                {currentTourStep.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip Tour
              </Button>

              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeTour;