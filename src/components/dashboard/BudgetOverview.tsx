import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const budgets = [
  {
    category: "Food & Dining",
    spent: 387.65,
    budget: 500,
    status: "on-track"
  },
  {
    category: "Transportation",
    spent: 245.30,
    budget: 300,
    status: "on-track"
  },
  {
    category: "Entertainment",
    spent: 180.50,
    budget: 150,
    status: "over-budget"
  },
  {
    category: "Utilities",
    spent: 89.32,
    budget: 200,
    status: "good"
  },
  {
    category: "Shopping",
    spent: 426.78,
    budget: 400,
    status: "warning"
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'good':
      return <CheckCircle className="w-4 h-4 text-success" />;
    case 'warning':
      return <Clock className="w-4 h-4 text-warning" />;
    case 'over-budget':
      return <AlertTriangle className="w-4 h-4 text-expense" />;
    default:
      return <CheckCircle className="w-4 h-4 text-success" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'bg-success/10 text-success border-success/20';
    case 'warning':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'over-budget':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-success/10 text-success border-success/20';
  }
};

export const BudgetOverview = () => {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budget Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Monthly budget tracking for January 2025</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.budget) * 100;
          const remaining = budget.budget - budget.spent;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(budget.status)}
                  <span className="font-medium text-sm">{budget.category}</span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(budget.status)}`}>
                    {budget.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${budget.spent.toFixed(2)} / ${budget.budget.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${remaining >= 0 ? remaining.toFixed(2) : '0.00'} remaining
                  </div>
                </div>
              </div>
              
              <Progress 
                value={Math.min(percentage, 100)} 
                className="h-2"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}% used</span>
                <span>
                  {remaining < 0 ? (
                    <span className="text-expense font-medium">
                      ${Math.abs(remaining).toFixed(2)} over budget
                    </span>
                  ) : (
                    `${(100 - percentage).toFixed(1)}% remaining`
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};