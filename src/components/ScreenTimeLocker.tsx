import { Clock, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { ParentSettings } from '@/types/adventure';

interface ScreenTimeLockerProps {
  settings: ParentSettings;
  onOverride?: () => void;
}

export const ScreenTimeLocker = ({ settings, onOverride }: ScreenTimeLockerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-card rounded-3xl p-8 shadow-float text-center space-y-6 animate-slide-up">
        <div className="w-24 h-24 mx-auto bg-gradient-adventure rounded-full flex items-center justify-center shadow-lg animate-pulse-glow">
          <Clock className="w-12 h-12 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Time for a Real Adventure! 🌳
          </h2>
          <p className="text-xl text-muted-foreground">
            You've been on screen for {settings.screenTimeLimit} minutes today.
          </p>
        </div>

        <div className="bg-gradient-sunshine/20 rounded-2xl p-6 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-secondary" />
          <p className="text-foreground font-medium text-lg">
            Hey {settings.childName}! The world outside is calling! 🌟
          </p>
          <p className="text-muted-foreground">
            Go play outside, dance around, or create something fun! 
            Your digital pet will be waiting for you when you come back!
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Here are some fun things to do:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted rounded-xl p-3">
              🏃‍♂️ Run around outside
            </div>
            <div className="bg-muted rounded-xl p-3">
              🎨 Draw or color
            </div>
            <div className="bg-muted rounded-xl p-3">
              📚 Read a book
            </div>
            <div className="bg-muted rounded-xl p-3">
              🧩 Play with toys
            </div>
          </div>
        </div>

        {onOverride && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Parent controls (requires supervision)
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onOverride}
              className="text-xs"
            >
              Parent Override
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Come back tomorrow for more adventures! 💚
        </p>
      </div>
    </div>
  );
};
