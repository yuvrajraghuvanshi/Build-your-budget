import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlySpending = [
  { month: 'Jul', spending: 2100 },
  { month: 'Aug', spending: 2400 },
  { month: 'Sep', spending: 2200 },
  { month: 'Oct', spending: 2800 },
  { month: 'Nov', spending: 2600 },
  { month: 'Dec', spending: 2847 },
];

const categorySpending = [
  { name: 'Food & Dining', value: 387.65, color: '#10b981' },
  { name: 'Transportation', value: 245.30, color: '#3b82f6' },
  { name: 'Shopping', value: 426.78, color: '#f59e0b' },
  { name: 'Entertainment', value: 180.50, color: '#ef4444' },
  { name: 'Utilities', value: 89.32, color: '#8b5cf6' },
  { name: 'Others', value: 156.45, color: '#6b7280' },
];

export const SpendingChart = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Monthly Spending Trend */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Spending Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly spending over the last 6 months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySpending} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
                formatter={(value) => [`$${value}`, 'Spending']}
              />
              <Bar 
                dataKey="spending" 
                fill="url(#spendingGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Category Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Spending by category this month</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex-1 space-y-2">
              {categorySpending.map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-foreground">{category.name}</span>
                  </div>
                  <span className="font-medium">${category.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};