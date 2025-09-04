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
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBudgets = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setBudgets(data || []);
    }
    setLoading(false);
  };

  const setBudget = async (categoryId: string, amount: number, period: 'monthly' = 'monthly') => {
    if (!user) return { error: 'User not authenticated' };

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      // Add weekly/yearly logic later
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

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
      .select()
      .single();

    if (!error) {
      fetchBudgets();
    }

    return { data, error };
  };

  // Get budget vs actual spending
  const getBudgetProgress = async (categoryId: string, period: 'monthly' = 'monthly') => {
    if (!user) return null;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Get budget
    const { data: budget } = await supabase
      .from('budgets')
      .select('*')
      .eq('category_id', categoryId)
      .eq('period', period)
      .gte('end_date', startDate)
      .single();

    // Get actual spending
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('category_id', categoryId)
      .eq('type', 'expense')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    const totalSpent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const budgetAmount = budget?.amount || 0;
    const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    return {
      budgetAmount,
      totalSpent,
      percentage,
      remaining: budgetAmount - totalSpent
    };
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  return {
    budgets,
    loading,
    fetchBudgets,
    setBudget,
    getBudgetProgress
  };
};