import { useAIChallenges } from '@/hooks/useAIChallenges';
import { ParentSettings } from '@/types/adventure';
import { AIChallengeCard } from './AIChallengeCard';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, RefreshCw, Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIChallengeSectionProps {
  settings: ParentSettings;
  onCompleteChallenge: (reward: number) => void;
}

export const AIChallengeSection = ({ settings, onCompleteChallenge }: AIChallengeSectionProps) => {
  const { 
    challenges, 
    weather, 
    isLoading, 
    generateChallenges, 
    completeChallenge,
    clearChallenges 
  } = useAIChallenges(settings);

  const handleComplete = async (challengeId: string, photoUrl: string, videoUrl: string, durationSeconds: number) => {
    completeChallenge(challengeId);
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && settings.childId) {
      // Save completion to database
      const { error } = await supabase
        .from('challenge_completions')
        .insert({
          child_id: settings.childId,
          challenge_id: challengeId,
          photo_url: photoUrl || null,
          video_url: videoUrl || null,
          duration_seconds: durationSeconds,
          points_awarded: challenge.reward,
          activity_type: 'ai',
          activity_name: challenge.title
        });

      if (error) {
        console.error('Failed to save challenge completion:', error);
      }

      onCompleteChallenge(challenge.reward);
    }
  };

  const allCompleted = challenges.length > 0 && challenges.every(c => c.completed);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-accent animate-pulse-glow" />
          <h2 className="text-3xl font-bold text-foreground">AI Personalized Challenges</h2>
          <Sparkles className="w-6 h-6 text-accent animate-pulse-glow" />
        </div>
        <p className="text-muted-foreground">
          Activities tailored just for you based on weather and your space!
        </p>
      </div>

      {/* Weather Info */}
      {weather && (
        <Card className="bg-gradient-to-r from-adventure-sky/20 to-adventure-sun/20 p-4">
          <div className="flex items-center justify-center gap-4 text-foreground">
            {weather.isRaining ? (
              <CloudRain className="w-6 h-6 text-primary" />
            ) : weather.temperature > 25 ? (
              <Sun className="w-6 h-6 text-secondary" />
            ) : (
              <Cloud className="w-6 h-6 text-muted-foreground" />
            )}
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              <span className="font-medium">{weather.temperature}°C</span>
            </div>
            <span className="font-medium capitalize">{weather.description}</span>
          </div>
        </Card>
      )}

      {/* No challenges yet */}
      {challenges.length === 0 && (
        <Card className="p-12 text-center space-y-4 bg-gradient-to-br from-accent/10 to-primary/10">
          <div className="w-20 h-20 mx-auto bg-gradient-adventure rounded-full flex items-center justify-center shadow-float animate-bounce-gentle">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Ready for AI-Powered Fun?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Let our AI create personalized physical activities based on the weather, 
            your age, and available space!
          </p>
          <Button
            onClick={generateChallenges}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-adventure hover:opacity-90 text-white shadow-lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Creating Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate My Challenges!
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            We'll check the weather and create perfect activities for you!
          </p>
        </Card>
      )}

      {/* Challenges Grid */}
      {challenges.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <AIChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={(photoUrl, videoUrl, durationSeconds) => 
                  handleComplete(challenge.id, photoUrl, videoUrl, durationSeconds)
                }
                childId={settings.childId || ''}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {allCompleted && (
              <Button
                onClick={generateChallenges}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-adventure hover:opacity-90 text-white shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Generate New Challenges
                  </>
                )}
              </Button>
            )}
            
            {!allCompleted && (
              <Button
                onClick={generateChallenges}
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Challenges
              </Button>
            )}
            
            <Button
              onClick={clearChallenges}
              variant="outline"
              size="lg"
            >
              Clear All
            </Button>
          </div>

          {allCompleted && (
            <Card className="p-6 bg-gradient-sunshine/20 text-center animate-slide-up">
              <p className="text-xl font-bold text-foreground">
                🌟 Wow! You completed all AI challenges! 🌟
              </p>
              <p className="text-muted-foreground mt-2">
                You're an amazing adventurer! Want more?
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
