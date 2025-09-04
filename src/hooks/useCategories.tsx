import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  is_default: boolean;
}

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (!error) {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const addCategory = async (category: Omit<Category, 'id' | 'is_default'>) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        ...category,
        user_id: user.id,
        is_default: false
      }])
      .select()
      .single();

    if (!error) {
      fetchCategories();
    }

    return { data, error };
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    expenseCategories: categories.filter(c => c.type === 'expense'),
    incomeCategories: categories.filter(c => c.type === 'income')
  };
};