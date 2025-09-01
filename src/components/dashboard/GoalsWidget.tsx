import { Target, Trophy, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const goals = [
  {
    title: "Emergency Fund",
    current: 3400,
    target: 5000,
    deadline: "Jun 2025",
    category: "savings",
    progress: 68
  },
  {
    title: "Vacation to Japan",
    current: 1850,
    target: 4000,
    deadline: "Dec 2025",
    category: "travel",
    progress: 46
  },
  {
    title: "New Laptop",
    current: 890,
    target: 2500,
    deadline: "Mar 2025",
    category: "tech",
    progress: 36
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'savings':
      return <Trophy className="w-4 h-4 text-success" />;
    case 'travel':
      return <Target className="w-4 h-4 text-info" />;
    case 'tech':
      return <TrendingUp className="w-4 h-4 text-warning" />;
    default:
      return <Target className="w-4 h-4 text-primary" />;
  }
};

export const GoalsWidget = () => {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Financial Goals</CardTitle>
          <p className="text-sm text-muted-foreground">Track your progress towards your goals</p>
        </div>
        <Button variant="ghost" size="sm">
          <Target className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(goal.category)}
                <span className="font-medium text-sm">{goal.title}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{goal.deadline}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">
                ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
              </span>
              <span className="text-primary font-medium">
                {goal.progress}%
              </span>
            </div>
            
            <Progress value={goal.progress} className="h-2" />
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                ${(goal.target - goal.current).toLocaleString()} remaining
              </span>
              <span className="text-success">
                On track
              </span>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full mt-4">
          View All Goals
        </Button>
      </CardContent>
    </Card>
  );
};