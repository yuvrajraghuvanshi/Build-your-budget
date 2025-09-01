import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BalanceCards = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Balance */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">$12,847.32</div>
          <p className="text-xs text-success flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            +2.5% from last month
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Income
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">+$4,250.00</div>
          <p className="text-xs text-muted-foreground mt-1">
            Salary, freelance, investments
          </p>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Expenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-expense">-$2,847.65</div>
          <p className="text-xs text-muted-foreground mt-1">
            Food, transport, utilities
          </p>
        </CardContent>
      </Card>

      {/* Savings Goal */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Savings Goal
          </CardTitle>
          <DollarSign className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">68%</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-gradient-success h-2 rounded-full" style={{ width: '68%' }}></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            $3,400 of $5,000 goal
          </p>
        </CardContent>
      </Card>
    </div>
  );
};