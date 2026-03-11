import { useState } from 'react';
import { AIChallenge, WeatherInfo } from '@/types/ai-challenge';
import { ParentSettings } from '@/types/adventure';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAIChallenges = (settings: ParentSettings) => {
  const [challenges, setChallenges] = useState<AIChallenge[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateChallenges = async () => {
    setIsLoading(true);
    
    try {
      // Get user's location for weather data
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (error) {
        console.log('Location access denied, continuing without weather data');
        // Continue without location data
      }

      const { data, error } = await supabase.functions.invoke('generate-challenges', {
        body: {
          childAge: settings.childAge,
          hasBackyard: settings.hasBackyard,
          apartmentSize: settings.apartmentSize,
          latitude,
          longitude,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before generating new challenges.",
            variant: "destructive",
          });
        } else if (data.error.includes('credits')) {
          toast({
            title: "AI Credits Needed",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        setIsLoading(false);
        return;
      }

      // Add unique IDs and completed status
      const newChallenges: AIChallenge[] = data.challenges.map((challenge: any) => ({
        ...challenge,
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        completed: false,
        generatedAt: new Date().toISOString(),
      }));

      setChallenges(newChallenges);
      setWeather(data.weather);
      
      toast({
        title: "New Challenges Generated! 🎉",
        description: `${newChallenges.length} personalized activities ready for ${settings.childName}!`,
      });

    } catch (error) {
      console.error('Error generating challenges:', error);
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Couldn't generate challenges. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(c => c.id === challengeId ? { ...c, completed: true } : c)
    );
  };

  const clearChallenges = () => {
    setChallenges([]);
    setWeather(null);
  };

  return {
    challenges,
    weather,
    isLoading,
    generateChallenges,
    completeChallenge,
    clearChallenges,
  };
};
