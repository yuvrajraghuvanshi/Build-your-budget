import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BudgetOverviewProps {
  budgets?: any[];
}

interface BudgetWithProgress {
  id: string;
  category: string;
  spent: number;
  budget: number;
  status: "good" | "warning" | "over";
  percentage: number;
}

export const BudgetOverview = ({ budgets: propBudgets }: BudgetOverviewProps) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgetProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get current month dates
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // If budgets are passed as props, use them
      if (propBudgets && propBudgets.length > 0) {
        const budgetsWithProgress = await Promise.all(
          propBudgets.map(async (budget) => {
            // Get actual spending for this category
            const { data: transactions } = await supabase
              .from('transactions')
              .select('amount')
              .eq('category_id', budget.category_id)
              .eq('type', 'expense')
              .gte('transaction_date', startDate)
              .lte('transaction_date', endDate);

            const spent = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            
            let status: "good" | "warning" | "over" = "good";
            if (percentage >= 100) {
              status = "over";
            } else if (percentage >= 75) {
              status = "warning";
            }

            return {
              id: budget.id,
              category: budget.category?.name || 'Uncategorized',
              spent,
              budget: budget.amount,
              status,
              percentage
            };
          })
        );
        
        setBudgets(budgetsWithProgress);
      } else {
        // If no budgets passed, fetch all budgets for the user
        const { data: userBudgets } = await supabase
          .from('budgets')
          .select(`
            *,
            category:categories(name, icon, color)
          `)
          .eq('user_id', user.id)
          .gte('end_date', startDate)
          .lte('start_date', endDate);

        if (userBudgets) {
          const budgetsWithProgress = await Promise.all(
            userBudgets.map(async (budget) => {
              // Get actual spending for this category
              const { data: transactions } = await supabase
                .from('transactions')
                .select('amount')
                .eq('category_id', budget.category_id)
                .eq('type', 'expense')
                .gte('transaction_date', startDate)
                .lte('transaction_date', endDate);

              const spent = transactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
              const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
              
              let status: "good" | "warning" | "over" = "good";
              if (percentage >= 100) {
                status = "over";
              } else if (percentage >= 75) {
                status = "warning";
              }

              return {
                id: budget.id,
                category: budget.category?.name || 'Uncategorized',
                spent,
                budget: budget.amount,
                status,
                percentage
              };
            })
          );
          
          setBudgets(budgetsWithProgress);
        }
      }
    } catch (error) {
      console.error('Error fetching budget progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetProgress();
  }, [user, propBudgets]);

  const getStatusIcon = (status: "good" | "warning" | "over") => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "warning":
        return <Clock className="w-4 h-4 text-warning" />;
      case "over":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getStatusColor = (status: "good" | "warning" | "over") => {
    switch (status) {
      case "good":
        return "text-success";
      case "warning":
        return "text-warning";
      case "over":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Budgets</CardTitle>
        <Badge variant="outline" className="text-xs">
          This Month
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(budget.status)}
                  <span className="font-medium text-sm">{budget.category}</span>
                </div>
                <div className={`text-sm ${getStatusColor(budget.status)}`}>
                  <span>${budget.spent.toFixed(2)}</span>
                  <span className="text-muted-foreground"> / ${budget.budget.toFixed(2)}</span>
                </div>
              </div>
              <Progress 
                value={Math.min(budget.percentage, 100)} 
                className="h-2"
                indicatorClassName={
                  budget.status === "over" ? "bg-destructive" : 
                  budget.status === "warning" ? "bg-warning" : "bg-success"
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budget.percentage.toFixed(0)}% spent</span>
                <span>${(budget.budget - budget.spent).toFixed(2)} left</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No budgets set for this month</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create budgets to track your spending
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};