import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Plus, Edit, Trash2, Loader2, MoreVertical } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { currencies, currencyMap } from "./onboarding/CurrencySelection";

interface TransactionFormData {
  amount: string;
  description: string;
  transaction_date: string;
  type: 'expense' | 'income';
  category_id: string;
}

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const {
    transactions,
    loading: transactionsLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions
  } = useTransactions();

  const {
    categories,
    loading: categoriesLoading,
    expenseCategories,
    fetchCategories,
    incomeCategories
  } = useCategories();
  const { profile } = useProfile();

  const [formData, setFormData] = useState<TransactionFormData>({
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split('T')[0],
    type: "expense",
    category_id: ""
  });

  // Filter categories based on transaction type
  const filteredCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  // Extract unique category names for filtering
  const categoryNames = Array.from(
    new Set(
      transactions
        .filter(t => t.category?.name)
        .map(t => t.category!.name)
    )
  );

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.category?.name === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        transaction_date: formData.transaction_date,
        type: formData.type,
        category_id: formData.category_id
      };

      const { error } = await addTransaction(transactionData);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Transaction added successfully",
        variant: "default",
      });

      setIsAddDialogOpen(false);
      setFormData({
        amount: "",
        description: "",
        transaction_date: new Date().toISOString().split('T')[0],
        type: "expense",
        category_id: ""
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTransaction) return;

    try {
      const updates = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        transaction_date: formData.transaction_date,
        type: formData.type,
        category_id: formData.category_id
      };

      const { error } = await updateTransaction(editingTransaction.id, updates);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Transaction updated successfully",
        variant: "default",
      });

      setIsEditDialogOpen(false);
      setEditingTransaction(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteTransaction(id);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      transaction_date: transaction.transaction_date.split('T')[0],
      type: transaction.type,
      category_id: transaction.category_id
    });
    setIsEditDialogOpen(true);
  };

  const handleTypeChange = (type: 'expense' | 'income') => {
    setFormData({
      ...formData,
      type,
      category_id: "" // Reset category when type changes
    });
  };

  if (transactionsLoading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage and track all your transactions</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
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
                      {filteredCategories.map((category) => (
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
                    "Add Transaction"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-none sm:flex sm:gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="sm:w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="sm:w-[140px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryNames.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">
              All Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const { date, time } = formatDate(transaction.transaction_date);
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border hover:bg-muted/20 transition-colors">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-full shrink-0 ${transaction.type === 'income' ? 'bg-success/10' : 'bg-expense/10'}`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownLeft className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-expense" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 space-y-1 sm:space-y-0">
                            {transaction.category && (
                              <Badge 
                                variant="outline" 
                                className="text-xs self-start"
                                style={{ 
                                  backgroundColor: `${transaction.category.color}20`,
                                  borderColor: transaction.category.color,
                                  color: transaction.category.color
                                }}
                              >
                                <span className="mr-1">{transaction.category.icon}</span>
                                <span className="hidden xs:inline">{transaction.category.name}</span>
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {date} • {time}
                            </span>
                          </div>
                          
                          {/* Mobile amount display */}
                          <div className="sm:hidden mt-2">
                            <span className={`text-lg font-semibold ${
                              transaction.type === 'income' ? 'text-success' : 'text-expense'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                        {/* Desktop amount display */}
                        <span className={`hidden sm:inline text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-success' : 'text-expense'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{currencyMap[profile?.preferred_currency]?.symbol ?? "$"}{Math.abs(transaction.amount).toFixed(2)}
                        </span>
                        
                        <div className="flex sm:space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(transaction)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            disabled={isDeleting}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
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
                    {filteredCategories.map((category) => (
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
                  "Update Transaction"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Transactions;