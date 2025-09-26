import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  user_id: string;
  created_at: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface BudgetProgress {
  budgetAmount: number;
  totalSpent: number;
  percentage: number;
  remaining: number;
  status: 'good' | 'warning' | 'over-budget';
}

export interface MonthlyBudgets {
  year: number;
  month: number;
  budgets: Budget[];
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  progress: Record<string, BudgetProgress>;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<{year: number, month: number}>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Fetch budgets for specific month
  const fetchBudgets = async (year?: number, month?: number) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const targetYear = year || currentMonth.year;
    const targetMonth = month || currentMonth.month;

    // Set current month for future operations
    if (year && month) {
      setCurrentMonth({ year, month });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBudgets(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set or update budget for specific month
  const setBudget = async (
    categoryId: string, 
    amount: number, 
    period: 'weekly' | 'monthly' | 'yearly' = 'monthly',
    year?: number,
    month?: number
  ) => {
    if (!user) return { error: 'User not authenticated' };

    const targetYear = year || currentMonth.year;
    const targetMonth = month || currentMonth.month;

    // Calculate date range based on period
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    let endDate: Date;

    switch (period) {
      case 'weekly':
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        endDate = new Date(targetYear, targetMonth, 0);
        break;
      case 'yearly':
        endDate = new Date(targetYear, 11, 31); // Dec 31
        break;
      default:
        endDate = new Date(targetYear, targetMonth, 0);
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .upsert([{
          user_id: user.id,
          category_id: categoryId,
          amount,
          period,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }], {
          onConflict: 'user_id,category_id,period,start_date'
        })
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Update local state if the budget belongs to current month
      if (data && isBudgetInCurrentMonth(data)) {
        setBudgets(prev => {
          const existingIndex = prev.findIndex(b => b.id === data.id);
          if (existingIndex >= 0) {
            const newBudgets = [...prev];
            newBudgets[existingIndex] = data;
            return newBudgets;
          } else {
            return [data, ...prev];
          }
        });
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  // Delete budget
  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove from current list
      setBudgets(prev => prev.filter(b => b.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Get budget progress for specific month
  const getBudgetProgress = async (
    categoryId: string, 
    period: 'weekly' | 'monthly' | 'yearly' = 'monthly',
    year?: number,
    month?: number
  ): Promise<BudgetProgress | null> => {
    if (!user) return null;

    const targetYear = year || currentMonth.year;
    const targetMonth = month || currentMonth.month;

    const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    try {
      // Get budget for the period
      const { data: budget } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .eq('period', period)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .single();

      // Get actual spending for the period
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const totalSpent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const budgetAmount = budget?.amount || 0;
      const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
      const remaining = budgetAmount - totalSpent;

      // Determine status
      let status: 'good' | 'warning' | 'over-budget' = 'good';
      if (percentage > 100) {
        status = 'over-budget';
      } else if (percentage > 75) {
        status = 'warning';
      }

      return {
        budgetAmount,
        totalSpent,
        percentage,
        remaining,
        status
      };
    } catch (err) {
      console.error('Error getting budget progress:', err);
      return null;
    }
  };

  // Get progress for all budgets in current month
  const getAllBudgetsProgress = async (year?: number, month?: number): Promise<Record<string, BudgetProgress>> => {
    const targetYear = year || currentMonth.year;
    const targetMonth = month || currentMonth.month;
    const progress: Record<string, BudgetProgress> = {};

    for (const budget of budgets) {
      const progressData = await getBudgetProgress(
        budget.category_id, 
        budget.period, 
        targetYear, 
        targetMonth
      );
      if (progressData) {
        progress[budget.id] = progressData;
      }
    }

    return progress;
  };

  // Get budgets for specific month with progress
  const getBudgetsByMonth = async (year: number, month: number): Promise<MonthlyBudgets> => {
    if (!user) {
      return { year, month, budgets: [], totalBudget: 0, totalSpent: 0, remaining: 0, progress: {} };
    }

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .lte('start_date', endDate)
        .gte('end_date', startDate)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const monthlyBudgets = data || [];
      const progress: Record<string, BudgetProgress> = {};

      // Calculate progress for each budget
      for (const budget of monthlyBudgets) {
        const progressData = await getBudgetProgress(budget.category_id, budget.period, year, month);
        if (progressData) {
          progress[budget.id] = progressData;
        }
      }

      const totalBudget = monthlyBudgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = Object.values(progress).reduce((sum, p) => sum + p.totalSpent, 0);
      const remaining = totalBudget - totalSpent;

      return {
        year,
        month,
        budgets: monthlyBudgets,
        totalBudget,
        totalSpent,
        remaining,
        progress
      };
    } catch (err: any) {
      console.error('Error fetching monthly budgets:', err);
      return { year, month, budgets: [], totalBudget: 0, totalSpent: 0, remaining: 0, progress: {} };
    }
  };

  // Get available months with budgets
  const getAvailableMonths = async (): Promise<{year: number, month: number}[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('start_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }

      const months = new Set<string>();
      data?.forEach(budget => {
        const date = new Date(budget.start_date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        months.add(key);
      });

      return Array.from(months).map(key => {
        const [year, month] = key.split('-').map(Number);
        return { year, month };
      });
    } catch (err: any) {
      console.error('Error fetching available months:', err);
      return [];
    }
  };

  // Get current month summary
  const getCurrentMonthSummary = async () => {
    const progress = await getAllBudgetsProgress();
    
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = Object.values(progress).reduce((sum, p) => sum + p.totalSpent, 0);
    const remaining = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      remaining,
      budgetCount: budgets.length,
      overBudgetCount: Object.values(progress).filter(p => p.status === 'over-budget').length,
      warningCount: Object.values(progress).filter(p => p.status === 'warning').length
    };
  };

  // Helper function to check if budget belongs to current month
  const isBudgetInCurrentMonth = (budget: Budget): boolean => {
    const budgetDate = new Date(budget.start_date);
    return budgetDate.getFullYear() === currentMonth.year && 
           budgetDate.getMonth() + 1 === currentMonth.month;
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  return {
    budgets,
    loading,
    error,
    currentMonth,
    fetchBudgets,
    setBudget,
    deleteBudget,
    getBudgetProgress,
    getAllBudgetsProgress,
    getBudgetsByMonth,
    getAvailableMonths,
    getCurrentMonthSummary,
    setCurrentMonth
  };
};