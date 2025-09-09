import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Clock, Plus, Edit, Loader2, TrendingUp } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { currencies, currencyMap } from "./onboarding/CurrencySelection";
import { useProfile } from "@/hooks/useProfile";

interface BudgetFormData {
  category_id: string;
  amount: string;
  period: 'weekly' | 'monthly' | 'yearly';
}

const Budgets = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [budgetProgress, setBudgetProgress] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const {
    budgets,
    loading: budgetsLoading,
    fetchBudgets,
    setBudget,
    getBudgetProgress
  } = useBudgets();

  const {
    categories,
    loading: categoriesLoading,
    expenseCategories
  } = useCategories();
  const { profile } = useProfile();

  const [formData, setFormData] = useState<BudgetFormData>({
    category_id: "",
    amount: "",
    period: "monthly"
  });

  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Object.values(budgetProgress).reduce((sum: number, progress: any) => sum + (progress?.totalSpent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  // Fetch budget progress for each budget
  useEffect(() => {
    const fetchBudgetProgress = async () => {
      const progress: Record<string, any> = {};
      
      for (const budget of budgets) {
        const progressData = await getBudgetProgress(budget.category_id, budget.period);
        if (progressData) {
          progress[budget.id] = progressData;
        }
      }
      
      setBudgetProgress(progress);
    };

    if (budgets.length > 0) {
      fetchBudgetProgress();
    }
  }, [budgets]);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        categoryId: formData.category_id,
        amount: parseFloat(formData.amount),
        period: formData.period
      };

      const { error } = await setBudget(budgetData.categoryId, budgetData.amount, budgetData.period);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Budget created successfully",
        variant: "default",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        category_id: "",
        amount: "",
        period: "monthly"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBudget) return;

    try {
      const budgetData = {
        categoryId: formData.category_id,
        amount: parseFloat(formData.amount),
        period: formData.period
      };

      const { error } = await setBudget(budgetData.categoryId, budgetData.amount, budgetData.period);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Budget updated successfully",
        variant: "default",
      });

      setIsEditDialogOpen(false);
      setEditingBudget(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setIsEditDialogOpen(true);
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage <= 75) return { status: 'good', color: 'text-success', icon: CheckCircle };
    if (percentage <= 90) return { status: 'warning', color: 'text-warning', icon: Clock };
    return { status: 'over-budget', color: 'text-destructive', icon: AlertTriangle };
  };

  if (budgetsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Track and manage your monthly budgets</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => 
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => 
                      setFormData({ ...formData, period: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading categories...
                    </>
                  ) : (
                    "Create Budget"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{totalBudget.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-expense">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{totalSpent.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${
                  totalRemaining >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{Math.abs(totalRemaining).toFixed(2)} {totalRemaining >= 0 ? 'left' : 'over'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="grid gap-6 lg:grid-cols-2">
          {budgets.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-4">Create your first budget to start tracking your expenses</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Budget
              </Button>
            </div>
          ) : (
            budgets.map((budget) => {
              const progress = budgetProgress[budget.id];
              const percentage = progress ? (progress.totalSpent / budget.amount) * 100 : 0;
              const statusInfo = getBudgetStatus(percentage);
              const Icon = statusInfo.icon;
              const remaining = progress ? budget.amount - progress.totalSpent : budget.amount;

              return (
                <Card key={budget.id} className="bg-gradient-card border-border/50 shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${statusInfo.color}`} />
                      <CardTitle className="text-lg">{budget.category?.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${
                        statusInfo.status === 'good' ? 'bg-success/10 text-success border-success/20' :
                        statusInfo.status === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {statusInfo.status.replace('-', ' ')}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(budget)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-expense">
                        {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{progress?.totalSpent?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{budget.amount.toFixed(2)}
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
                          `${currencyMap[profile?.preferred_currency]?.symbol ?? "$"}${Math.abs(remaining).toFixed(2)} over` : 
                          `${currencyMap[profile?.preferred_currency]?.symbol ?? "$"}${remaining.toFixed(2)} left`
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditBudget} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => 
                    setFormData({ ...formData, category_id: value })
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Budget Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-period">Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => 
                    setFormData({ ...formData, period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={categoriesLoading}
              >
                {categoriesLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading categories...
                  </>
                ) : (
                  "Update Budget"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Budgets;