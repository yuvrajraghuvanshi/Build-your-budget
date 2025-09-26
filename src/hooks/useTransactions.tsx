import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  type: 'expense' | 'income';
  category_id: string;
  user_id: string;
  created_at: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface MonthlyTransactions {
  year: number;
  month: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<{year: number, month: number}>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Fetch transactions with monthly filtering by default
  const fetchTransactions = async (year?: number, month?: number, limit = 100) => {
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
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add transaction with proper date handling
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id,
          // Ensure transaction_date is properly formatted
          transaction_date: new Date(transaction.transaction_date).toISOString().split('T')[0]
        }])
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Only add to current list if it belongs to current month
      if (data && isTransactionInCurrentMonth(data)) {
        setTransactions(prev => [data, ...prev]);
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          // Update date if provided
          ...(updates.transaction_date && {
            transaction_date: new Date(updates.transaction_date).toISOString().split('T')[0]
          })
        })
        .eq('id', id)
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Update in current list or remove/add based on month
        setTransactions(prev => {
          const index = prev.findIndex(t => t.id === id);
          if (index === -1) {
            // Transaction not in current list, add if belongs to current month
            return isTransactionInCurrentMonth(data) ? [data, ...prev] : prev;
          } else {
            // Update existing or remove if no longer in current month
            if (isTransactionInCurrentMonth(data)) {
              const newTransactions = [...prev];
              newTransactions[index] = data;
              return newTransactions;
            } else {
              return prev.filter(t => t.id !== id);
            }
          }
        });
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove from current list
      setTransactions(prev => prev.filter(t => t.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Get transactions for specific month with summary
  const getTransactionsByMonth = async (year: number, month: number): Promise<MonthlyTransactions> => {
    if (!user) {
      return { year, month, transactions: [], totalIncome: 0, totalExpenses: 0, netAmount: 0 };
    }

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (error) {
        throw error;
      }

      const transactions = data || [];
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        year,
        month,
        transactions,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses
      };
    } catch (err: any) {
      console.error('Error fetching monthly transactions:', err);
      return { year, month, transactions: [], totalIncome: 0, totalExpenses: 0, netAmount: 0 };
    }
  };

  // Get available months with transactions
  const getAvailableMonths = async (): Promise<{year: number, month: number}[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) {
        throw error;
      }

      const months = new Set<string>();
      data?.forEach(transaction => {
        const date = new Date(transaction.transaction_date);
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

  // Helper function to check if transaction belongs to current month
  const isTransactionInCurrentMonth = (transaction: Transaction): boolean => {
    const transactionDate = new Date(transaction.transaction_date);
    return transactionDate.getFullYear() === currentMonth.year && 
           transactionDate.getMonth() + 1 === currentMonth.month;
  };

  // Get current month summary
  const getCurrentMonthSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return {
    transactions,
    loading,
    error,
    currentMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    getTransactionsByMonth,
    getAvailableMonths,
    getCurrentMonthSummary,
    setCurrentMonth
  };
};