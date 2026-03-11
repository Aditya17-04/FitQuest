import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot-fox.png';
import { useState } from 'react';

interface MascotProps {
  message: string;
  className?: string;
  animate?: boolean;
  additionalMessages?: string[];
  onMessageChange?: (index: number) => void;
}

export const Mascot = ({ message, className, animate = true, additionalMessages = [], onMessageChange }: MascotProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const allMessages = [message, ...additionalMessages];

  const handleClick = () => {
    if (allMessages.length > 1) {
      const newIndex = (currentMessageIndex + 1) % allMessages.length;
      setCurrentMessageIndex(newIndex);
      if (onMessageChange) {
        onMessageChange(newIndex);
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div 
        className={cn(
          "relative w-32 h-32 cursor-pointer transition-transform hover:scale-110",
          animate && "animate-float"
        )}
        onClick={handleClick}
      >
        <img 
          src={mascotImage} 
          alt="Finn the Fox" 
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      <div className="relative bg-card rounded-2xl p-6 shadow-playful max-w-md">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card rotate-45" />
        <p className="text-foreground text-lg font-medium leading-relaxed relative z-10">
          {allMessages[currentMessageIndex]}
        </p>
        {allMessages.length > 1 && (
          <div className="flex gap-1 justify-center mt-3">
            {allMessages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentMessageIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
