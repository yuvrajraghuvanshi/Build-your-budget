import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencies, currencyMap } from "@/pages/onboarding/CurrencySelection";

interface BalanceCardsProps {
  profile?: any;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;

}

export const BalanceCards = ({ profile, totalBalance, monthlyIncome, monthlyExpenses }: BalanceCardsProps) => {
  console.log({ profile })
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Balance */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-3xl font-bold text-foreground">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{totalBalance.toFixed(2)}</p>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-3xl font-bold text-success">+{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{monthlyIncome.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-3xl font-bold text-expense">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{monthlyExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-expense" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};