import { Trophy, Star } from 'lucide-react';
import { Progress } from './ui/progress';

interface ProgressBarProps {
  currentChapter: number;
  totalChapters: number;
  totalPoints: number;
}

export const ProgressBar = ({ currentChapter, totalChapters, totalPoints }: ProgressBarProps) => {
  const progressPercentage = (currentChapter / totalChapters) * 100;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-playful space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">
            Chapter {currentChapter} of {totalChapters}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-secondary" />
          <span className="font-bold text-foreground">{totalPoints} Points</span>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-3" />
    </div>
  );
};
