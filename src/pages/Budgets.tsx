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
import { AlertTriangle, CheckCircle, Clock, Plus, Edit, Loader2, TrendingUp, ChevronLeft, ChevronRight, Calendar, Trash2 } from "lucide-react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<{ year: number, month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const { toast } = useToast();
  const {
    budgets,
    loading: budgetsLoading,
    error,
    fetchBudgets,
    setBudget,
    deleteBudget,
    getCurrentMonthSummary,
    setCurrentMonth: setHookCurrentMonth
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

  const [monthSummary, setMonthSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    budgetCount: 0,
    overBudgetCount: 0,
    warningCount: 0
  });

  // Fetch budget progress and summary
  useEffect(() => {
    const fetchBudgetData = async () => {
      if (budgets.length > 0) {
        const progress = await getAllBudgetsProgress();
        setBudgetProgress(progress);

        const summary = await getCurrentMonthSummary();
        setMonthSummary(summary);
      } else {
        setBudgetProgress({});
        setMonthSummary({
          totalBudget: 0,
          totalSpent: 0,
          remaining: 0,
          budgetCount: 0,
          overBudgetCount: 0,
          warningCount: 0
        });
      }
    };

    fetchBudgetData();
  }, [budgets, currentMonth]);

  // Month navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    let newYear = currentMonth.year;
    let newMonth = currentMonth.month;

    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      if (newYear > (new Date()).getFullYear() || (newYear === (new Date()).getFullYear() && newMonth >= (new Date()).getMonth() + 1)) {
        // Prevent navigating to future months
        return;
      }
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }

    const newMonthData = { year: newYear, month: newMonth };
    setCurrentMonth(newMonthData);
    setHookCurrentMonth(newMonthData);
    fetchBudgets(newYear, newMonth);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    const newMonthData = { year: now.getFullYear(), month: now.getMonth() + 1 };
    setCurrentMonth(newMonthData);
    setHookCurrentMonth(newMonthData);
    fetchBudgets(newMonthData.year, newMonthData.month);
  };

  const formatMonthYear = (year: number, month: number) => {
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const budgetData = {
        categoryId: formData.category_id,
        amount: parseFloat(formData.amount),
        period: formData.period
      };

      const { error } = await setBudget(
        budgetData.categoryId,
        budgetData.amount,
        budgetData.period,
        currentMonth.year,
        currentMonth.month
      );

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

      const { error } = await setBudget(
        budgetData.categoryId,
        budgetData.amount,
        budgetData.period,
        currentMonth.year,
        currentMonth.month
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Budget updated successfully",
        variant: "default",
      });

      setIsEditDialogOpen(false);
         setFormData({
        category_id: "",
        amount: "",
        period: "monthly"
      });
      setEditingBudget(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteBudget(id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Budget deleted successfully",
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete budget",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
        {/* Header with Month Navigation */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">
              Track and manage your budgets for {formatMonthYear(currentMonth.year, currentMonth.month)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-2 px-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {formatMonthYear(currentMonth.year, currentMonth.month)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentMonth.year === (new Date()).getFullYear() && currentMonth.month === (new Date()).getMonth() + 1}
                    onClick={() => navigateMonth('next')}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToCurrentMonth}
                    className="h-8 text-xs"
                  >
                    Current
                  </Button>
                </div>
              </CardContent>
            </Card>

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

                  <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                    This budget will be created for {formatMonthYear(currentMonth.year, currentMonth.month)}
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
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{monthSummary.totalBudget.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthSummary.budgetCount} budget{monthSummary.budgetCount !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-expense">
                  {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{monthSummary.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((monthSummary.totalSpent / monthSummary.totalBudget) * 100 || 0).toFixed(1)}% of budget
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${monthSummary.remaining >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                  {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{Math.abs(monthSummary.remaining).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthSummary.remaining >= 0 ? 'Left' : 'Over budget'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex justify-center space-x-2 mt-1">
                  {monthSummary.overBudgetCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {monthSummary.overBudgetCount} over
                    </Badge>
                  )}
                  {monthSummary.warningCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                      {monthSummary.warningCount} warning
                    </Badge>
                  )}
                  {monthSummary.overBudgetCount === 0 && monthSummary.warningCount === 0 && (
                    <Badge variant="default" className="text-xs bg-success/10 text-success">
                      All good
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories */}
        <div className="grid gap-6 lg:grid-cols-2">
          {budgets.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No budgets for {formatMonthYear(currentMonth.year, currentMonth.month)}</h3>
              <p className="text-muted-foreground mb-4">Create your first budget to start tracking your expenses</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Budget
              </Button>
            </div>
          ) : (
            budgets.map((budget) => {
              const progress = budgetProgress[budget.id];
              const percentage = progress ? progress.percentage : 0;
              const statusInfo = getBudgetStatus(percentage);
              const Icon = statusInfo.icon;
              const remaining = progress ? progress.remaining : budget.amount;

              return (
                <Card key={budget.id} className="bg-gradient-card border-border/50 shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${statusInfo.color}`} />
                      <CardTitle className="text-lg">{budget.category?.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {budget.period}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(budget)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        disabled={isDeleting}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
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

              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                This budget will be updated for {formatMonthYear(currentMonth.year, currentMonth.month)}
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