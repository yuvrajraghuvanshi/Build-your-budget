import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category_id: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  target_month?: number;
  target_year?: number;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface GoalProgress {
  [goalId: string]: {
    [year: number]: {
      [month: number]: number;
    };
  };
}

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<GoalProgress>({});
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const fetchMonthlyProgress = async (year: number, month: number) => {
    if (!user || goals.length === 0) return;

    const goalIds = goals.map(goal => goal.id);
    const { data, error } = await supabase
      .from('goal_progress')
      .select('*')
      .in('goal_id', goalIds)
      .eq('year', year)
      .eq('month', month);

    if (!error && data) {
      const progress: GoalProgress = { ...monthlyProgress };
      
      data.forEach(record => {
        if (!progress[record.goal_id]) {
          progress[record.goal_id] = {};
        }
        if (!progress[record.goal_id][record.year]) {
          progress[record.goal_id][record.year] = {};
        }
        progress[record.goal_id][record.year][record.month] = record.amount_saved;
      });

      setMonthlyProgress(progress);
    }
  };

  const addGoal = async (
    title: string, 
    targetAmount: number, 
    categoryId: string, 
    deadline: string, 
    priority: 'low' | 'medium' | 'high' = 'medium',
    targetMonth?: number | null,
    targetYear?: number | null,
    isRecurring: boolean = false
  ) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: user.id,
        title,
        target_amount: targetAmount,
        current_amount: 0,
        category_id: categoryId,
        deadline,
        priority,
        target_month: targetMonth,
        target_year: targetYear,
        is_recurring: isRecurring
      }])
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .single();

    if (!error) {
      setGoals(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const updateGoal = async (
    goalId: string,
    updates: Partial<{
      title: string;
      target_amount: number;
      category_id: string;
      deadline: string;
      priority: 'low' | 'medium' | 'high';
      target_month?: number | null;
      target_year?: number | null;
      is_recurring: boolean;
    }>
  ) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select(`
        *,
        category:categories(name, icon, color)
      `)
      .single();

    if (!error) {
      setGoals(prev => prev.map(goal => goal.id === goalId ? data : goal));
    }

    return { data, error };
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (!error) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      // Also remove from monthly progress
      setMonthlyProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[goalId];
        return newProgress;
      });
    }

    return { error };
  };

  const addToGoal = async (goalId: string, amount: number, month: number, year: number) => {
    if (!user) return { error: 'User not authenticated' };

    // Check if progress record exists for this month/year
    const { data: existingProgress } = await supabase
      .from('goal_progress')
      .select('amount_saved')
      .eq('goal_id', goalId)
      .eq('month', month)
      .eq('year', year)
      .single();

    let newAmount = amount;
    if (existingProgress) {
      newAmount += existingProgress.amount_saved;
    }

    const { data, error } = await supabase
      .from('goal_progress')
      .upsert({
        goal_id: goalId,
        month,
        year,
        amount_saved: newAmount
      }, {
        onConflict: 'goal_id,month,year'
      })
      .select()
      .single();

    if (!error) {
      // Update local state
      setMonthlyProgress(prev => ({
        ...prev,
        [goalId]: {
          ...prev[goalId],
          [year]: {
            ...prev[goalId]?.[year],
            [month]: newAmount
          }
        }
      }));

      // Update goal's current_amount (total across all months)
      const { data: goalData } = await supabase
        .from('goal_progress')
        .select('amount_saved')
        .eq('goal_id', goalId);

      const totalAmount = goalData?.reduce((sum, record) => sum + record.amount_saved, 0) || 0;

      await supabase
        .from('goals')
        .update({ current_amount: totalAmount })
        .eq('id', goalId);

      // Refresh goals to get updated current_amount
      fetchGoals();
    }

    return { data, error };
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  return {
    goals,
    monthlyProgress,
    loading,
    fetchGoals,
    fetchMonthlyProgress,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal
  };
};