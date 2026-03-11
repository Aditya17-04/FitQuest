import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PhotoData {
  id: string;
  photo_url: string | null;
  video_url: string | null;
  completed_at: string;
  points_awarded: number;
  challenge_id: string;
  activity_name?: string;
  activity_type?: string;
}

export const usePhotoGallery = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const childId = localStorage.getItem('activeChildId');
      if (!childId) {
        setLoading(false);
        return;
      }

      // Fetch all challenge completions with photos or videos
      const { data, error } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('child_id', childId)
        .or('photo_url.not.is.null,video_url.not.is.null')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Use activity_type and activity_name from database
      const enrichedPhotos = (data || []).map(completion => ({
        id: completion.id,
        photo_url: completion.photo_url,
        video_url: completion.video_url,
        completed_at: completion.completed_at,
        points_awarded: completion.points_awarded,
        challenge_id: completion.challenge_id,
        activity_name: completion.activity_name || 'Activity',
        activity_type: completion.activity_type || 'story', // default to story for older entries
      }));

      setPhotos(enrichedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photo gallery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group photos by date
  const groupedByDate = photos.reduce((acc, photo) => {
    const date = photo.completed_at.split('T')[0]; // Get YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, PhotoData[]>);

  // Group photos by activity type
  const groupedByType = photos.reduce((acc, photo) => {
    const type = photo.activity_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(photo);
    return acc;
  }, {} as Record<string, PhotoData[]>);

  return {
    photos,
    loading,
    groupedByDate,
    groupedByType,
    refetch: fetchPhotos,
  };
};
