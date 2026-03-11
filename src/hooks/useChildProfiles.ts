import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChildProfile } from '@/types/database';
import { useAuth } from './useAuth';

export const useChildProfiles = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChildren([]);
      setLoading(false);
      return;
    }

    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChildren((data || []) as ChildProfile[]);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChild = async (child: Omit<ChildProfile, 'id' | 'parent_id' | 'created_at' | 'updated_at' | 'current_chapter' | 'total_points' | 'completed_activities' | 'pet_name' | 'pet_health' | 'pet_happiness' | 'pet_energy' | 'pet_level' | 'screen_time_today' | 'last_activity_date' | 'badges'>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('child_profiles')
        .insert({
          parent_id: user.id,
          ...child,
        });

      if (error) throw error;
      await fetchChildren();
      return { error: null };
    } catch (error) {
      console.error('Error creating child:', error);
      return { error };
    }
  };

  const updateChild = async (childId: string, updates: Partial<ChildProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('child_profiles')
        .update(updates)
        .eq('id', childId)
        .eq('parent_id', user.id);

      if (error) throw error;
      await fetchChildren();
      return { error: null };
    } catch (error) {
      console.error('Error updating child:', error);
      return { error };
    }
  };

  const deleteChild = async (childId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('child_profiles')
        .delete()
        .eq('id', childId)
        .eq('parent_id', user.id);

      if (error) throw error;
      await fetchChildren();
      return { error: null };
    } catch (error) {
      console.error('Error deleting child:', error);
      return { error };
    }
  };

  return {
    children,
    loading,
    createChild,
    updateChild,
    deleteChild,
    refetch: fetchChildren,
  };
};
