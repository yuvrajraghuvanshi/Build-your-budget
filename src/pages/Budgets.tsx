import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Plus, Edit } from "lucide-react";

const budgets = [
  { id: 1, category: "Food & Dining", spent: 387.65, budget: 500, status: "on-track", color: "text-success", icon: CheckCircle },
  { id: 2, category: "Transportation", spent: 245.30, budget: 300, status: "on-track", color: "text-success", icon: CheckCircle },
  { id: 3, category: "Entertainment", spent: 180.50, budget: 150, status: "over-budget", color: "text-destructive", icon: AlertTriangle },
  { id: 4, category: "Utilities", spent: 89.32, budget: 200, status: "good", color: "text-success", icon: CheckCircle },
  { id: 5, category: "Shopping", spent: 426.78, budget: 400, status: "warning", color: "text-warning", icon: Clock },
  { id: 6, category: "Healthcare", spent: 125.00, budget: 300, status: "good", color: "text-success", icon: CheckCircle },
];

const Budgets = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Track and manage your monthly budgets</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">$1,850</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-expense">$1,454.55</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-success">$395.45</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="grid gap-6 lg:grid-cols-2">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.budget) * 100;
            const remaining = budget.budget - budget.spent;
            const Icon = budget.icon;
            
            return (
              <Card key={budget.id} className="bg-gradient-card border-border/50 shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${budget.color}`} />
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`text-xs ${
                      budget.status === 'good' || budget.status === 'on-track' ? 'bg-success/10 text-success border-success/20' :
                      budget.status === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {budget.status.replace('-', ' ')}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-expense">
                      ${budget.spent.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of ${budget.budget.toFixed(2)}
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-3"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {percentage.toFixed(1)}% used
                    </span>
                    <span className={remaining < 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {remaining < 0 ? 
                        `$${Math.abs(remaining).toFixed(2)} over` : 
                        `$${remaining.toFixed(2)} left`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Budgets;