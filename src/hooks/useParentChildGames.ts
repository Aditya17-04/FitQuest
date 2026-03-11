import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { chapters } from '@/data/chapters';
import { toast } from '@/hooks/use-toast';

interface ParentChildGame {
  id: string;
  title: string;
  description: string;
  instruction: string;
  reward: number;
  completed: boolean;
  chapter: number;
}

export const useParentChildGames = () => {
  const [games, setGames] = useState<ParentChildGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const childId = localStorage.getItem('activeChildId');
      if (!childId) {
        setLoading(false);
        return;
      }

      // Get child profile to check completed activities
      const { data: childProfile, error: profileError } = await supabase
        .from('child_profiles')
        .select('completed_activities, current_chapter')
        .eq('id', childId)
        .single();

      if (profileError) throw profileError;

      const completedActivities = childProfile?.completed_activities || [];
      const currentChapter = childProfile?.current_chapter || 1;

      // Extract all parent-child activities from unlocked chapters
      const parentChildGames: ParentChildGame[] = [];
      
      chapters.forEach((chapter) => {
        if (chapter.id <= currentChapter) {
          chapter.activities.forEach((activity) => {
            if (activity.type === 'parent-child') {
              parentChildGames.push({
                id: activity.id,
                title: activity.title,
                description: activity.description,
                instruction: activity.instruction,
                reward: activity.reward,
                completed: completedActivities.includes(activity.id),
                chapter: chapter.id,
              });
            }
          });
        }
      });

      setGames(parentChildGames);
    } catch (error) {
      console.error('Error fetching parent-child games:', error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeGame = async (activityId: string, photoFile: File | null, videoFile: File | null = null) => {
    try {
      const childId = localStorage.getItem('activeChildId');
      if (!childId) return false;

      let photoUrl = null;
      let videoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${childId}/${activityId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('challenge-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('challenge-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Upload video if provided
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${childId}/${activityId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('challenge-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('challenge-videos')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;
      }

      // Get current child data
      const { data: childProfile, error: fetchError } = await supabase
        .from('child_profiles')
        .select('completed_activities, total_points, pet_happiness, pet_health, pet_energy')
        .eq('id', childId)
        .single();

      if (fetchError) throw fetchError;

      const game = games.find(g => g.id === activityId);
      if (!game) return false;

      // Update child profile
      const completedActivities = [...(childProfile.completed_activities || []), activityId];
      const newPoints = (childProfile.total_points || 0) + game.reward;
      
      // Boost pet stats for parent-child activities (extra reward!)
      const newHappiness = Math.min(100, (childProfile.pet_happiness || 100) + 15);
      const newHealth = Math.min(100, (childProfile.pet_health || 100) + 10);
      const newEnergy = Math.min(100, (childProfile.pet_energy || 100) + 10);

      const { error: updateError } = await supabase
        .from('child_profiles')
        .update({
          completed_activities: completedActivities,
          total_points: newPoints,
          pet_happiness: newHappiness,
          pet_health: newHealth,
          pet_energy: newEnergy,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', childId);

      if (updateError) throw updateError;

      // Record completion
      const { error: completionError } = await supabase
        .from('challenge_completions')
        .insert({
          child_id: childId,
          challenge_id: activityId,
          points_awarded: game.reward,
          photo_url: photoUrl,
          video_url: videoUrl,
          duration_seconds: 0,
          activity_type: 'family',
          activity_name: game.title
        });

      if (completionError) throw completionError;

      await fetchGames();
      return true;
    } catch (error) {
      console.error('Error completing game:', error);
      toast({
        title: "Error",
        description: "Failed to complete game. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    games,
    loading,
    completeGame,
    refetch: fetchGames,
  };
};
