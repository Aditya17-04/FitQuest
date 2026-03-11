import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chapters } from '@/data/chapters';
import { useAuth } from '@/hooks/useAuth';
import { useChildProfiles } from '@/hooks/useChildProfiles';
import { ChapterView } from '@/components/ChapterView';
import { Mascot } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { ScreenTimeLocker } from '@/components/ScreenTimeLocker';
import { AIChallengeSection } from '@/components/AIChallengeSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Clock, Users, Image } from 'lucide-react';
import bgImage from '@/assets/adventure-background.png';
import mascotImage from '@/assets/mascot-fox.png';
import { ParentSettings } from '@/types/adventure';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { children, loading: childrenLoading, updateChild } = useChildProfiles();
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [currentChild, setCurrentChild] = useState<any>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isTimeLocked, setIsTimeLocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Get active theme
  const { getBackgroundClasses, getOverlayClasses } = useTheme(activeChildId);

  // Add timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading || childrenLoading) {
        console.warn('Loading timeout - redirecting to auth');
        navigate('/auth');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading, childrenLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const savedChildId = localStorage.getItem('activeChildId');
    if (savedChildId) {
      setActiveChildId(savedChildId);
    }
  }, []);

  useEffect(() => {
    if (activeChildId && children.length > 0) {
      const child = children.find(c => c.id === activeChildId);
      setCurrentChild(child || null);
      
      // Initialize remaining time when child is loaded
      if (child) {
        const screenTimeLimit = 30; // minutes
        const usedMinutes = child.screen_time_today || 0;
        const remainingMinutes = Math.max(0, screenTimeLimit - usedMinutes);
        setRemainingSeconds(remainingMinutes * 60);
        setIsTimeLocked(remainingMinutes === 0);
      }
    }
  }, [activeChildId, children]);

  // Real-time countdown timer
  useEffect(() => {
    if (!currentChild || isTimeLocked) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newSeconds = prev - 1;
        
        if (newSeconds <= 0) {
          setIsTimeLocked(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }

        // Update database every minute
        const currentMinute = Math.ceil(newSeconds / 60);
        const lastMinute = Math.ceil(prev / 60);
        
        if (currentMinute !== lastMinute && currentMinute % 1 === 0) {
          const usedMinutes = 30 - currentMinute;
          updateChild(currentChild.id, {
            screen_time_today: usedMinutes
          });
        }

        return newSeconds;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentChild, isTimeLocked, updateChild]);

  const handleBackToDashboard = () => {
    localStorage.removeItem('activeChildId');
    navigate('/dashboard');
  };

  const completeActivity = async (activityId: string, points: number, photoUrl?: string, videoUrl?: string) => {
    if (!currentChild) {
      toast.error('No active child profile found');
      return;
    }

    try {
      const newCompletedActivities = [...currentChild.completed_activities, activityId];
      const newTotalPoints = currentChild.total_points + points;
      
      const currentChapterData = chapters.find(ch => ch.id === currentChild.current_chapter);
      const allActivitiesComplete = currentChapterData?.activities.every(
        act => newCompletedActivities.includes(act.id)
      );

      const newChapter = allActivitiesComplete ? currentChild.current_chapter + 1 : currentChild.current_chapter;

      // Save photo/video completion record if media was uploaded
      if (photoUrl || videoUrl) {
        const { error: insertError } = await supabase
          .from('challenge_completions')
          .insert({
            child_id: currentChild.id,
            challenge_id: activityId,
            photo_url: photoUrl || null,
            video_url: videoUrl || null,
            points_awarded: points,
            activity_type: 'story',
            activity_name: currentChapterData?.activities.find(a => a.id === activityId)?.title || 'Story Adventure'
          });

        if (insertError) {
          console.error('Error saving challenge completion:', insertError);
          toast.error('Failed to save activity photo/video');
        }
      }

      await updateChild(currentChild.id, {
        completed_activities: newCompletedActivities,
        total_points: newTotalPoints,
        current_chapter: newChapter,
      });

      toast.success(`🎉 Activity completed! +${points} points!`);
    } catch (error) {
      console.error('Error completing activity:', error);
      toast.error('Failed to complete activity. Please try again.');
    }
  };

  const completeAIChallenge = async (points: number) => {
    if (!currentChild) return;

    const newTotalPoints = currentChild.total_points + points;

    await updateChild(currentChild.id, {
      total_points: newTotalPoints,
    });
  };

  const isScreenTimeLocked = () => {
    return isTimeLocked;
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMascotMessage = (chapterId: number) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    return chapter?.story || "Welcome to your adventure!";
  };

  if (authLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src={mascotImage} alt="Loading" className="w-24 h-24 mx-auto mb-4 animate-bounce" />
          <p className="text-foreground text-lg font-medium">Loading FitQuest...</p>
          <p className="text-muted-foreground text-sm">This should only take a moment</p>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline"
            className="mt-4"
          >
            Having trouble? Click here
          </Button>
        </div>
      </div>
    );
  }

  if (!currentChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <img src={mascotImage} alt="Sparkle" className="w-32 h-32 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to FitQuest!</h2>
          <p className="text-muted-foreground mb-6">
            Please select a child profile from the parent dashboard to start playing.
          </p>
          <Button onClick={handleBackToDashboard}>
            <User className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentChapter = chapters.find((ch) => ch.id === currentChild.current_chapter) || chapters[0];
  
  // Create settings object for components
  const settings: ParentSettings = {
    childName: currentChild.child_name,
    childAge: currentChild.child_age,
    hasBackyard: currentChild.play_space === 'backyard' || currentChild.play_space === 'outdoor',
    apartmentSize: 
      currentChild.play_space === 'small_apartment' ? 'small' :
      currentChild.play_space === 'medium_apartment' ? 'medium' :
      currentChild.play_space === 'large_apartment' ? 'large' : 'medium',
    screenTimeLimit: 30, // Default
    childId: currentChild.id,
  };

  if (isScreenTimeLocked()) {
    return <ScreenTimeLocker settings={settings} />;
  }

  const isLastChapter = currentChild.current_chapter >= chapters.length;

  return (
    <div className={`min-h-screen ${getBackgroundClasses()}`}>
      <div className={`min-h-screen ${getOverlayClasses()}`}>
        <div className="container mx-auto px-4 py-8">{/* Header */}
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">
                {currentChild.child_name}'s Adventure
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-muted-foreground text-sm">Age {currentChild.child_age}</p>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-md transition-colors ${
                  remainingSeconds < 300 ? 'bg-red-100 animate-pulse' : 'bg-white/90'
                }`}>
                  <Clock className={`w-4 h-4 ${remainingSeconds < 300 ? 'text-red-500' : 'text-primary'}`} />
                  <span className={`font-mono font-bold text-lg ${
                    remainingSeconds < 300 ? 'text-red-600' : 'text-foreground'
                  }`}>
                    {formatTimeRemaining(remainingSeconds)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="bg-background/80 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => navigate('/photo-gallery')}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Image className="h-5 w-5 mr-2" />
                Photos
              </Button>
              <Button
                onClick={() => navigate('/parent-child-games')}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Family
              </Button>
            </div>
          </div>

          {/* Progress and Stats */}
          <div className="mb-8">
            <ProgressBar
              currentChapter={currentChild.current_chapter}
              totalChapters={chapters.length}
              totalPoints={currentChild.total_points}
            />
          </div>

          {/* Adventure Tabs */}
          <div className="bg-background/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="story">📖 Story Adventure</TabsTrigger>
                <TabsTrigger value="ai-challenges">✨ AI Challenges</TabsTrigger>
              </TabsList>
              <TabsContent value="story" className="mt-6">
                <ChapterView
                  chapter={currentChapter}
                  completedActivityIds={currentChild.completed_activities}
                  onCompleteActivity={completeActivity}
                  onNextChapter={() => {}}
                  isLastChapter={isLastChapter}
                  childId={currentChild.id}
                />
              </TabsContent>
              <TabsContent value="ai-challenges" className="mt-6">
                <AIChallengeSection
                  settings={settings}
                  onCompleteChallenge={completeAIChallenge}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
