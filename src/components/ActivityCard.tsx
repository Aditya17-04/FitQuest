import { Activity } from '@/types/adventure';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Star, Users, Leaf, Search, Camera, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivityCardProps {
  activity: Activity;
  onComplete: (photoUrl?: string, videoUrl?: string) => void;
  isCompleted: boolean;
  childId?: string;
}

export const ActivityCard = ({ activity, onComplete, isCompleted, childId }: ActivityCardProps) => {
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

  const handleCompleteActivity = async () => {
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
        const fileName = `${childId}/${activity.id}-${Date.now()}.${fileExt}`;
        
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
        const fileName = `${childId}/${activity.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('challenge-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('challenge-videos')
          .getPublicUrl(fileName);

        videoUrl = publicUrl;
      }

      onComplete(photoUrl, videoUrl);
      setShowDialog(false);
      setPhotoFile(null);
      setPhotoPreview('');
      setVideoFile(null);
      setVideoPreview('');
      toast.success(`🎉 Activity completed! +${activity.reward} points!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'movement':
        return <Star className="w-6 h-6" />;
      case 'parent-child':
        return <Users className="w-6 h-6" />;
      case 'nature':
        return <Leaf className="w-6 h-6" />;
      case 'object-hunt':
        return <Search className="w-6 h-6" />;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'movement':
        return 'from-primary to-primary/70';
      case 'parent-child':
        return 'from-secondary to-secondary/70';
      case 'nature':
        return 'from-success to-success/70';
      case 'object-hunt':
        return 'from-accent to-accent/70';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isCompleted ? "opacity-75" : "shadow-playful hover:shadow-float hover:scale-105"
    )}>
      <div className={cn("bg-gradient-to-r p-4 text-white", getActivityColor())}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              {getActivityIcon()}
            </div>
            <div>
              <h3 className="font-bold text-lg">{activity.title}</h3>
              <p className="text-sm opacity-90">{activity.description}</p>
            </div>
          </div>
          {isCompleted ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <Circle className="w-8 h-8 text-white/50" />
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-gradient-to-br from-muted to-muted/50 rounded-xl p-4 border-2 border-accent/20">
          <p className="text-foreground font-medium text-lg text-center leading-relaxed">
            {activity.instruction}
          </p>
          {activity.count && (
            <p className="text-center text-accent font-bold mt-2 text-xl">
              {activity.count} times!
            </p>
          )}
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="font-bold text-foreground">+{activity.reward} points</span>
            </div>
            
            <Button 
              onClick={() => setShowDialog(true)}
              className="bg-gradient-adventure hover:opacity-90 text-white shadow-md"
              size="lg"
            >
              <Camera className="w-4 h-4 mr-2" />
              Complete! 📸
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="space-y-2">
            {/* Show uploaded media */}
            {(activity.photoUrl || activity.videoUrl) && (
              <div className="grid grid-cols-2 gap-2">
                {activity.photoUrl && (
                  <img 
                    src={activity.photoUrl} 
                    alt="Completed activity" 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )}
                {activity.videoUrl && (
                  <video 
                    src={activity.videoUrl} 
                    className="w-full h-24 object-cover rounded-lg"
                    controls
                  />
                )}
              </div>
            )}
            <div className="text-center text-success font-medium animate-slide-up">
              ✓ Completed! Great job!
            </div>
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
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-blue-50 border-4 border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              📸 Capture Your Achievement!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Upload a photo or video of: <strong>{activity.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-100 rounded-xl p-4 border-2 border-blue-300">
                <Label htmlFor="activity-photo" className="text-blue-800 font-bold mb-2 block text-sm">
                  Photo 📷
                </Label>
                <Input
                  id="activity-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="bg-white border-2 border-blue-300 text-xs"
                />
              </div>
              <div className="bg-green-100 rounded-xl p-4 border-2 border-green-300">
                <Label htmlFor="activity-video" className="text-green-800 font-bold mb-2 block text-sm">
                  Video 🎥
                </Label>
                <Input
                  id="activity-video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="bg-white border-2 border-green-300 text-xs"
                />
              </div>
            </div>

            {photoPreview && (
              <div className="relative rounded-2xl overflow-hidden border-4 border-blue-300 shadow-xl">
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
              <div className="relative rounded-2xl overflow-hidden border-4 border-green-300 shadow-xl">
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
                onClick={handleCompleteActivity}
                disabled={!canComplete}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90 text-white font-bold shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Complete (+{activity.reward} pts)
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
