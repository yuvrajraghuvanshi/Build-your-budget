import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: any[];
  monthlySpending: any[];
  categorySpending: any[];
  budgetOverview: any[];
}

export const useDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    recentTransactions: [],
    monthlySpending: [],
    categorySpending: [],
    budgetOverview: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Get current month and year for filtering
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      // Fetch all data in parallel for better performance
      const [
        { data: transactionsData },
        { data: balanceData },
        { data: monthlySpendingData },
        { data: categorySpendingData },
        { data: budgetData }
      ] = await Promise.all([
        // Recent transactions
        supabase
          .from('transactions')
          .select(`
            *,
            category:categories(name, icon, color)
          `)
          .order('transaction_date', { ascending: false })
          .limit(5),
        
        // Total balance (sum of all transactions)
        supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id),
        
        // Monthly spending for the last 6 months
        supabase
          .rpc('get_monthly_spending', {
            user_id: user.id,
            month_count: 6
          }),
        
        // Category spending for current month
        supabase
          .rpc('get_category_spending', {
            user_id: user.id,
            start_date: startOfMonth,
            end_date: endOfMonth
          }),
        
        // Budget overview
        supabase
          .from('budgets')
          .select(`
            *,
            category:categories(name, icon, color)
          `)
          .eq('user_id', user.id)
          .gte('end_date', startOfMonth)
          .lte('start_date', endOfMonth)
      ]);

      // Calculate total balance, monthly income and expenses
      let totalBalance = 0;
      let monthlyIncome = 0;
      let monthlyExpenses = 0;

      if (balanceData) {
        balanceData.forEach(transaction => {
          const amount = Number(transaction.amount);
          if (transaction.type === 'income') {
            totalBalance += amount;
            monthlyIncome += amount;
          } else {
            totalBalance -= amount;
            monthlyExpenses += amount;
          }
        });
      }

      // Transform data for the dashboard
      setDashboardData({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        recentTransactions: transactionsData || [],
        monthlySpending: monthlySpendingData || [],
        categorySpending: categorySpendingData || [],
        budgetOverview: budgetData || []
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
};