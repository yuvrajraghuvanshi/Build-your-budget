import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

const monthlyData = [
  { month: 'Aug', income: 4250, expenses: 3200, savings: 1050 },
  { month: 'Sep', income: 4100, expenses: 3450, savings: 650 },
  { month: 'Oct', income: 4300, expenses: 3100, savings: 1200 },
  { month: 'Nov', income: 4250, expenses: 3350, savings: 900 },
  { month: 'Dec', income: 4500, expenses: 3200, savings: 1300 },
  { month: 'Jan', income: 4250, expenses: 2848, savings: 1402 },
];

const categoryData = [
  { name: 'Food & Dining', value: 387.65, color: '#10b981' },
  { name: 'Transportation', value: 245.30, color: '#3b82f6' },
  { name: 'Entertainment', value: 180.50, color: '#8b5cf6' },
  { name: 'Utilities', value: 89.32, color: '#f59e0b' },
  { name: 'Shopping', value: 426.78, color: '#ef4444' },
  { name: 'Healthcare', value: 125.00, color: '#06b6d4' },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
          </div>
          <Select defaultValue="6months">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Income</p>
                  <p className="text-2xl font-bold text-success">$4,275</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <p className="text-xs text-success mt-2">↗ +2.1% from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Expenses</p>
                  <p className="text-2xl font-bold text-expense">$3,191</p>
                </div>
                <TrendingDown className="w-8 h-8 text-expense" />
              </div>
              <p className="text-xs text-success mt-2">↓ -5.3% from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Savings Rate</p>
                  <p className="text-2xl font-bold text-primary">25.3%</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-success mt-2">↗ +8.2% from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Worth Growth</p>
                  <p className="text-2xl font-bold text-primary">$1,084</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs text-success mt-2">↗ +12.5% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Savings Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;