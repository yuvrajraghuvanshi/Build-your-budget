import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Target, Plus, Calendar as CalendarIcon, DollarSign, Edit, Trash2, Loader2, TrendingUp } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { currencies, currencyMap } from "./onboarding/CurrencySelection";
import { useProfile } from "@/hooks/useProfile";

interface GoalFormData {
  title: string;
  target_amount: string;
  category_id: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
}

interface AddMoneyFormData {
  amount: string;
}

const Goals = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const { toast } = useToast();
  const {
    goals,
    loading: goalsLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal
  } = useGoals();

  const {
    categories,
    loading: categoriesLoading,
    expenseCategories
  } = useCategories();

  const { profile } = useProfile();

  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    target_amount: "",
    category_id: "",
    deadline: new Date(),
    priority: "medium"
  });

  const [addMoneyFormData, setAddMoneyFormData] = useState<AddMoneyFormData>({
    amount: ""
  });

  // Calculate totals
  const totalGoals = goals.length;
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const avgProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount * 100), 0) / goals.length 
    : 0;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const goalData = {
        title: formData.title,
        targetAmount: parseFloat(formData.target_amount),
        categoryId: formData.category_id,
        deadline: formData.deadline.toISOString().split('T')[0],
        priority: formData.priority
      };

      const { error } = await addGoal(
        goalData.title,
        goalData.targetAmount,
        goalData.categoryId,
        goalData.deadline,
        goalData.priority
      );
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal created successfully",
        variant: "default",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        target_amount: "",
        category_id: "",
        deadline: new Date(),
        priority: "medium"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGoal) return;

    try {
      const goalData = {
        title: formData.title,
        target_amount: parseFloat(formData.target_amount),
        category_id: formData.category_id,
        deadline: formData.deadline.toISOString().split('T')[0],
        priority: formData.priority
      };

      const { error } = await updateGoal(editingGoal.id, goalData);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal updated successfully",
        variant: "default",
      });

      setIsEditDialogOpen(false);
      setEditingGoal(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal) return;

    try {
      const amount = parseFloat(addMoneyFormData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const { error } = await addToGoal(selectedGoal.id, amount);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${currencyMap[profile?.preferred_currency]?.symbol ?? "$"}${amount.toFixed(2)} added to goal successfully`,
        variant: "default",
      });

      setIsAddMoneyDialogOpen(false);
      setSelectedGoal(null);
      setAddMoneyFormData({ amount: "" });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add money to goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    try {
      const { error } = await deleteGoal(selectedGoal.id);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal deleted successfully",
        variant: "default",
      });

      setIsDeleteDialogOpen(false);
      setSelectedGoal(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      category_id: goal.category_id,
      deadline: new Date(goal.deadline),
      priority: goal.priority
    });
    setIsEditDialogOpen(true);
  };

  const openAddMoneyDialog = (goal: any) => {
    setSelectedGoal(goal);
    setAddMoneyFormData({ amount: "" });
    setIsAddMoneyDialogOpen(true);
  };

  const openDeleteDialog = (goal: any) => {
    setSelectedGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  if (goalsLoading) {
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
            <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial milestones</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Emergency Fund, Vacation, etc."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    required
                  />
                </div>

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
                  <Label htmlFor="deadline">Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? (
                          format(formData.deadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={(date) => date && setFormData({ ...formData, deadline: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
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
                    "Create Goal"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-xl font-bold">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Target</p>
                  <p className="text-xl font-bold">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-info" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-xl font-bold">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-xl font-bold">
                    {Math.round(avgProgress)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {goals.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">Create your first goal to start tracking your savings progress</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const percentage = (goal.current_amount / goal.target_amount) * 100;
              const remaining = goal.target_amount - goal.current_amount;
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={goal.id} className="bg-gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${
                          goal.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          goal.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-success/10 text-success border-success/20'
                        }`}>
                          {goal.priority} priority
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {goal.category?.name || 'Uncategorized'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-success">
                          {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          of {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} goal
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {percentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to go
                        </p>
                      </div>
                    </div>
                    
                    <Progress value={percentage} className="h-3" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                      </div>
                      <span className="text-muted-foreground">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        onClick={() => openAddMoneyDialog(goal)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Add Money
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => openDeleteDialog(goal)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Goal Title</Label>
                <Input
                  id="edit-title"
                  type="text"
                  placeholder="e.g., Emergency Fund, Vacation, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-target_amount">Target Amount</Label>
                <Input
                  id="edit-target_amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
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
                <Label htmlFor="edit-deadline">Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? (
                        format(formData.deadline, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) => date && setFormData({ ...formData, deadline: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
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
                  "Update Goal"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Money Dialog */}
        <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Money to "{selectedGoal?.title}"</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Add</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={addMoneyFormData.amount}
                  onChange={(e) => setAddMoneyFormData({ amount: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current amount:</span>
                <span className="font-medium">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{selectedGoal?.current_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target amount:</span>
                <span className="font-medium">{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{selectedGoal?.target_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium">
                  {currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{(selectedGoal ? selectedGoal.target_amount - selectedGoal.current_amount : 0).toFixed(2)}
                </span>
              </div>

              <Button type="submit" className="w-full">
                Add Money
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Goal</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete the goal "{selectedGoal?.title}"? This action cannot be undone.</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteGoal}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Goals;