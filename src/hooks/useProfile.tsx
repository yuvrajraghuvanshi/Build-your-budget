import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  preferred_currency: string;
  monthly_income?: number;
  occupation?: string;
  financial_goal?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'User not authenticated' };
    console.log({updates})

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (!error) {
      setProfile(data);
    }

    return { data, error };
  };

  const updateCurrency = async (currency: string) => {
    return updateProfile({ preferred_currency: currency });
  };

  const updateProfileDetails = async (
    firstName: string,
    lastName: string,
    monthlyIncome?: number,
    occupation?: string,
    financialGoal?: string
  ) => {
    return updateProfile({
      first_name: firstName,
      last_name: lastName,
      monthly_income: monthlyIncome,
      occupation,
      financial_goal: financialGoal
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { error: 'User not authenticated' };

    // First, verify the current password by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { error: signInError };
    }

    // If current password is correct, update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error: updateError };
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    updateCurrency,
    updateProfileDetails,
    changePassword
  };
};