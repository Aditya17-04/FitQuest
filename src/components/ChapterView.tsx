import { Chapter } from '@/types/adventure';
import { Mascot } from './Mascot';
import { ActivityCard } from './ActivityCard';
import { Button } from './ui/button';
import { ArrowRight, Trophy } from 'lucide-react';
import { useState } from 'react';

interface ChapterViewProps {
  chapter: Chapter;
  completedActivityIds: string[];
  onCompleteActivity: (activityId: string, reward: number, photoUrl?: string, videoUrl?: string) => void;
  onNextChapter: () => void;
  isLastChapter: boolean;
  childId?: string;
}

export const ChapterView = ({
  chapter,
  completedActivityIds,
  onCompleteActivity,
  onNextChapter,
  isLastChapter,
  childId,
}: ChapterViewProps) => {
  const [highlightedActivityIndex, setHighlightedActivityIndex] = useState<number | null>(null);
  
  const allActivitiesComplete = chapter.activities.every(
    act => completedActivityIds.includes(act.id)
  );

  const handleMascotMessageChange = (messageIndex: number) => {
    // messageIndex 0 is the main story, 1-4 are the activity messages
    if (messageIndex > 0) {
      setHighlightedActivityIndex(messageIndex - 1);
      // Clear highlight after 2 seconds
      setTimeout(() => setHighlightedActivityIndex(null), 2000);
    } else {
      setHighlightedActivityIndex(null);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Chapter Header */}
      <div className="text-center space-y-2">
        <div className="inline-block bg-gradient-adventure text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
          Chapter {chapter.id}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          {chapter.title}
        </h2>
      </div>

      {/* Mascot with Story */}
      <Mascot 
        message={chapter.story} 
        additionalMessages={chapter.mascotMessages}
        onMessageChange={handleMascotMessageChange}
      />

      {/* Activities */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-foreground">
          Your Adventures
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {chapter.activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={highlightedActivityIndex === index ? 'ring-4 ring-accent rounded-xl transition-all' : ''}
            >
              <ActivityCard
                activity={activity}
                isCompleted={completedActivityIds.includes(activity.id)}
                onComplete={(photoUrl, videoUrl) => onCompleteActivity(activity.id, activity.reward, photoUrl, videoUrl)}
                childId={childId}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Complete */}
      {allActivitiesComplete && (
        <div className="bg-gradient-sunshine rounded-3xl p-8 shadow-float text-center space-y-4 animate-slide-up">
          <Trophy className="w-16 h-16 mx-auto text-white drop-shadow-lg" />
          <h3 className="text-3xl font-bold text-white">
            Chapter Complete! 🎉
          </h3>
          <p className="text-white text-lg">
            Amazing work! You've completed all the activities in this chapter!
          </p>
          {!isLastChapter && (
            <Button
              onClick={onNextChapter}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg text-lg font-bold"
            >
              Continue to Next Chapter
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
          {isLastChapter && (
            <div className="space-y-2">
              <p className="text-white font-bold text-xl">
                🌟 You've completed the entire adventure! 🌟
              </p>
              <p className="text-white">
                You're an amazing adventurer! Keep playing and being active every day!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
