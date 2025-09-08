import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, Tag, FileText } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

const categories = [
  { value: "food", label: "🍔 Food & Dining", color: "bg-orange-500" },
  { value: "transport", label: "🚗 Transportation", color: "bg-blue-500" },
  { value: "shopping", label: "🛍️ Shopping", color: "bg-purple-500" },
  { value: "entertainment", label: "🎬 Entertainment", color: "bg-pink-500" },
  { value: "bills", label: "💡 Bills & Utilities", color: "bg-yellow-500" },
  { value: "healthcare", label: "🏥 Healthcare", color: "bg-red-500" },
  { value: "education", label: "📚 Education", color: "bg-indigo-500" },
  { value: "other", label: "📋 Other", color: "bg-gray-500" },
];

const FirstExpense = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast({
        title: "Missing information",
        description: "Please enter an amount and select a category",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Save to database
    const { error } = await addTransaction({
      amount: parseFloat(amount),
      description,
      transaction_date: date,
      type: 'expense',
      category_id: category
    });

    if (error) {
      toast({
        title: "Error saving expense",
        description: "Please try again",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    toast({
      title: "Great job! 🎉",
      description: "Your first expense has been added successfully",
    });

    navigate("/");
    setIsSaving(false);
  };
  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₱</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">PennyPinch</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Add Your First Expense</h2>
          <p className="text-muted-foreground">
            Let's start tracking your spending with your first expense entry
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="What was this expense for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>
                <Button type="submit" className="flex-1">
                  Add Expense
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirstExpense;