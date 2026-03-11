import { AIChallenge } from '@/types/ai-challenge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Sparkles, Home, TreePine, Camera, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIChallengeCardProps {
  challenge: AIChallenge;
  onComplete: (photoUrl: string, videoUrl: string, durationSeconds: number) => void;
  childId: string;
}

export const AIChallengeCard = ({ challenge, onComplete, childId }: AIChallengeCardProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const canComplete = (photoFile || videoFile) && !uploading;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setVideoFile(null);
      setVideoPreview('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setPhotoFile(null);
      setPhotoPreview('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteChallenge = async () => {
    if (!canComplete) {
      toast.error('Please upload a photo or video first!');
      return;
    }

    setUploading(true);
    try {
      let photoUrl = '';
      let videoUrl = '';

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${childId}/${challenge.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('challenge-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('challenge-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Upload video if provided
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${childId}/${challenge.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('challenge-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('challenge-videos')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;
      }

      onComplete(photoUrl, videoUrl, 0);
      setShowDialog(false);
      setPhotoFile(null);
      setPhotoPreview('');
      setVideoFile(null);
      setVideoPreview('');
      toast.success(`🎉 Challenge completed! +${challenge.reward} points!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'movement':
        return '🏃‍♂️';
      case 'dance':
        return '💃';
      case 'balance':
        return '🧘';
      case 'strength':
        return '💪';
      case 'stretching':
        return '🤸';
      default:
        return '⭐';
    }
  };

  const getTypeColor = () => {
    switch (challenge.type) {
      case 'movement':
        return 'from-primary to-primary/70';
      case 'dance':
        return 'from-secondary to-secondary/70';
      case 'balance':
        return 'from-accent to-accent/70';
      case 'strength':
        return 'from-success to-success/70';
      case 'stretching':
        return 'from-primary/70 to-accent/70';
      default:
        return 'from-primary to-primary/70';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      challenge.completed ? "opacity-75" : "shadow-playful hover:shadow-float hover:scale-105"
    )}>
      <div className={cn(
        "bg-gradient-to-r p-4 text-white relative",
        getTypeColor()
      )}>
        <div className="absolute top-2 right-2">
          <Sparkles className="w-5 h-5 animate-pulse-glow" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTypeIcon()}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {challenge.isIndoor ? (
                  <Home className="w-4 h-4" />
                ) : (
                  <TreePine className="w-4 h-4" />
                )}
                <span className="text-xs font-medium opacity-90">
                  {challenge.isIndoor ? 'Indoor' : 'Outdoor'} Activity
                </span>
              </div>
              <h3 className="font-bold text-lg">{challenge.title}</h3>
              <p className="text-sm opacity-90">{challenge.description}</p>
            </div>
          </div>
          {challenge.completed ? (
            <CheckCircle2 className="w-8 h-8 text-white flex-shrink-0" />
          ) : (
            <Circle className="w-8 h-8 text-white/50 flex-shrink-0" />
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-gradient-to-br from-muted to-muted/50 rounded-xl p-4 border-2 border-accent/20">
          <p className="text-foreground font-medium text-lg text-center leading-relaxed">
            {challenge.instruction}
          </p>
          {challenge.count && (
            <p className="text-center text-accent font-bold mt-2 text-xl">
              {challenge.count} times!
            </p>
          )}
        </div>

        {!challenge.completed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-bold text-foreground text-lg">
                +{challenge.reward} AI points
              </span>
            </div>
            
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-gradient-adventure hover:opacity-90 text-white shadow-md"
              size="lg"
            >
              <Camera className="w-4 h-4 mr-2" />
              Complete! 🎉
            </Button>
          </div>
        )}

        {challenge.completed && (
          <div className="text-center text-success font-medium animate-slide-up">
            ✓ Completed! Amazing work!
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={() => {
        setShowDialog(false);
        setPhotoFile(null);
        setPhotoPreview('');
        setVideoFile(null);
        setVideoPreview('');
      }}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-purple-50 border-4 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI Challenge Complete!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Upload proof of: <strong>{challenge.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-100 rounded-xl p-4 border-2 border-purple-300">
                <Label htmlFor="ai-photo" className="text-purple-800 font-bold mb-2 block text-sm">
                  Photo 📷
                </Label>
                <Input
                  id="ai-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="bg-white border-2 border-purple-300 text-xs"
                />
              </div>
              <div className="bg-pink-100 rounded-xl p-4 border-2 border-pink-300">
                <Label htmlFor="ai-video" className="text-pink-800 font-bold mb-2 block text-sm">
                  Video 🎥
                </Label>
                <Input
                  id="ai-video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="bg-white border-2 border-pink-300 text-xs"
                />
              </div>
            </div>

            {photoPreview && (
              <div className="relative rounded-2xl overflow-hidden border-4 border-purple-300 shadow-xl">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full p-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            )}

            {videoPreview && (
              <div className="relative rounded-2xl overflow-hidden border-4 border-pink-300 shadow-xl">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-64 object-cover bg-black"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full p-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDialog(false);
                  setPhotoFile(null);
                  setPhotoPreview('');
                  setVideoFile(null);
                  setVideoPreview('');
                }}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-100"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteChallenge}
                disabled={!canComplete}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-bold shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Complete (+{challenge.reward} pts)
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
