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
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
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

  const addGoal = async (
    title: string, 
    targetAmount: number, 
    categoryId: string, 
    deadline: string, 
    priority: 'low' | 'medium' | 'high' = 'medium'
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
        priority
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
    }

    return { error };
  };

  const addToGoal = async (goalId: string, amount: number) => {
    if (!user) return { error: 'User not authenticated' };

    // First get the current amount
    const { data: goalData } = await supabase
      .from('goals')
      .select('current_amount')
      .eq('id', goalId)
      .single();

    if (!goalData) return { error: 'Goal not found' };

    const newAmount = goalData.current_amount + amount;
    
    const { data, error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
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

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  return {
    goals,
    loading,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal
  };
};