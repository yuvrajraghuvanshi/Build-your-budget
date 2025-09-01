import { MoreVertical, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const transactions = [
  {
    id: 1,
    description: "Salary Deposit",
    amount: 4250.00,
    type: "income",
    category: "Salary",
    date: "Today",
    time: "2:30 PM"
  },
  {
    id: 2,
    description: "Grocery Shopping",
    amount: -127.45,
    type: "expense",
    category: "Food",
    date: "Yesterday",
    time: "6:15 PM"
  },
  {
    id: 3,
    description: "Netflix Subscription",
    amount: -15.99,
    type: "expense",
    category: "Entertainment",
    date: "Dec 28",
    time: "12:00 AM"
  },
  {
    id: 4,
    description: "Investment Return",
    amount: 245.80,
    type: "income",
    category: "Investment",
    date: "Dec 27",
    time: "9:45 AM"
  },
  {
    id: 5,
    description: "Electric Bill",
    amount: -89.32,
    type: "expense",
    category: "Utilities",
    date: "Dec 26",
    time: "3:20 PM"
  }
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Salary: "bg-success/10 text-success border-success/20",
    Food: "bg-warning/10 text-warning border-warning/20",
    Entertainment: "bg-info/10 text-info border-info/20",
    Investment: "bg-success/10 text-success border-success/20",
    Utilities: "bg-muted text-muted-foreground border-muted"
  };
  return colors[category] || "bg-muted text-muted-foreground border-muted";
};

export const RecentTransactions = () => {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-success/10' : 'bg-expense/10'}`}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft className="w-4 h-4 text-success" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-expense" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {transaction.date} • {transaction.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-semibold ${
                transaction.amount > 0 ? 'text-success' : 'text-expense'
              }`}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};