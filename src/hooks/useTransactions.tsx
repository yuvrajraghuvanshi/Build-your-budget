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
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions
  const fetchTransactions = async (limit = 50) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) {
      setError(error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  // Add transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: user.id
      }])
      .select()
      .single();

    if (!error) {
      fetchTransactions(); // Refresh list
    }

    return { data, error };
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      fetchTransactions(); // Refresh list
    }

    return { data, error };
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTransactions(); // Refresh list
    }

    return { error };
  };

  // Get transactions for specific month
  const getTransactionsByMonth = async (year: number, month: number) => {
    if (!user) return [];

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching monthly transactions:', error);
      return [];
    }

    return data || [];
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
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    getTransactionsByMonth
  };
};