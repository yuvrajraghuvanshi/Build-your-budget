import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const budgets = [
  {
    category: "Food & Dining",
    spent: 388,
    budget: 500,
    status: "good"
  },
  {
    category: "Entertainment",
    spent: 181,
    budget: 150,
    status: "over"
  },
  {
    category: "Transportation",
    spent: 245,
    budget: 300,
    status: "good"
  }
];

export const BudgetOverview = () => {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budgets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.budget) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{budget.category}</span>
                <div className="text-sm">
                  <span className={budget.status === 'over' ? 'text-destructive' : 'text-foreground'}>
                    ${budget.spent}
                  </span>
                  <span className="text-muted-foreground"> / ${budget.budget}</span>
                </div>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};