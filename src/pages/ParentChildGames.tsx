import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParentChildGames } from '@/hooks/useParentChildGames';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Camera, Trophy, Users, Heart, Star, Sparkles, CheckCircle, ShoppingBag, Image } from 'lucide-react';
import { toast } from 'sonner';
import mascotImage from '@/assets/mascot-fox.png';
import bgImage from '@/assets/adventure-background.png';

export default function ParentChildGames() {
  const navigate = useNavigate();
  const { games, loading, completeGame } = useParentChildGames();
  const activeChildId = localStorage.getItem('activeChildId');
  const { getBackgroundClasses, getOverlayClasses } = useTheme(activeChildId);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

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

  const handleCompleteGame = async () => {
    if ((!photoFile && !videoFile) || !selectedGame) {
      toast.error('Please upload a photo or video of your activity!');
      return;
    }

    setUploading(true);
    const success = await completeGame(selectedGame.id, photoFile, videoFile);
    setUploading(false);

    if (success) {
      toast.success(`🎉 ${selectedGame.reward} points earned!`);
      setSelectedGame(null);
      setPhotoFile(null);
      setPhotoPreview('');
      setVideoFile(null);
      setVideoPreview('');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundClasses()}`}>
        <div className={`min-h-screen ${getOverlayClasses()} flex items-center justify-center`}>
          <div className="text-center">
            <img src={mascotImage} alt="Loading" className="w-24 h-24 mx-auto mb-4 animate-bounce" />
            <p className="text-xl font-bold text-foreground">Loading family fun...</p>
          </div>
        </div>
      </div>
    );
  }

  const completedGames = games.filter(g => g.completed).length;
  const totalGames = games.length;

  return (
    <div className={`min-h-screen ${getBackgroundClasses()}`}>
      <div className={`min-h-screen ${getOverlayClasses()}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div id="family-top" className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">
                👨‍👩‍👧 Family Activities
              </h1>
              <p className="text-muted-foreground mt-2">
                Complete: <span className="font-bold text-foreground">{completedGames} / {totalGames}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="bg-background/80 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Adventure
              </Button>
              <Button
                onClick={() => navigate('/photo-gallery')}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Image className="h-5 w-5 mr-2" />
                Photos
              </Button>
            </div>
          </div>

          {/* Family Activities Content */}
          <div className="bg-background/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
            {/* Progress Card */}
            <Card id="progress" className="mb-6 border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Your Progress</p>
                      <p className="text-2xl font-bold text-foreground">
                        {completedGames} / {totalGames} Activities Completed!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalGames) }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-8 h-8 ${
                          i < completedGames
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Games Grid */}
            <div id="activities" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => {
            const colors = [
              'from-pink-400 to-rose-400',
              'from-purple-400 to-indigo-400',
              'from-blue-400 to-cyan-400',
              'from-green-400 to-emerald-400',
              'from-yellow-400 to-orange-400',
              'from-red-400 to-pink-400',
            ];
            const gradientColor = colors[index % colors.length];

            return (
              <Card 
                key={game.id}
                id={`activity-${game.id}`}
                className={`relative overflow-hidden transition-all hover:shadow-2xl border-4 border-white ${
                  game.completed ? 'opacity-90' : 'hover:scale-105 animate-float-slow'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${gradientColor} p-4 relative`}>
                  <div className="absolute top-2 right-2">
                    {game.completed ? (
                      <CheckCircle className="w-8 h-8 text-white fill-white" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase">Family Activity</span>
                  </div>
                  <h3 className="text-2xl font-black text-white pr-10">
                    {game.title}
                  </h3>
                </div>

                <CardContent className="p-6 bg-white">
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    {game.description}
                  </p>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border-2 border-purple-200">
                    <div className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-800 mb-1">How to Play:</p>
                        <p className="text-sm text-gray-600">{game.instruction}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm px-3 py-1 font-bold shadow-md">
                      <Trophy className="w-4 h-4 mr-1" />
                      {game.reward} points
                    </Badge>
                    
                    {!game.completed ? (
                      <Button
                        onClick={() => setSelectedGame(game)}
                        className={`bg-gradient-to-r ${gradientColor} hover:opacity-90 text-white font-bold shadow-lg`}
                        size="sm"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Complete!
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-2 border-green-300">
                        ✓ Done!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>

          {games.length === 0 && (
            <Card className="border-2">
              <CardContent className="text-center py-16">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  No Activities Yet!
                </h3>
                <p className="text-muted-foreground">
                  Complete more chapters to unlock fun family activities! 🎯
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upload Photo Dialog */}
          <Dialog open={!!selectedGame} onOpenChange={() => {
          setSelectedGame(null);
          setPhotoFile(null);
          setPhotoPreview('');
          setVideoFile(null);
          setVideoPreview('');
        }}>
          <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-purple-50 border-4 border-purple-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📸 Capture the Fun!
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                Take a photo of you and your child completing: <strong>{selectedGame?.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-100 rounded-xl p-4 border-2 border-purple-300">
                  <Label htmlFor="photo" className="text-purple-800 font-bold mb-2 block text-sm">
                    Photo 📷
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="bg-white border-2 border-purple-300 text-xs"
                  />
                </div>
                <div className="bg-pink-100 rounded-xl p-4 border-2 border-pink-300">
                  <Label htmlFor="video" className="text-pink-800 font-bold mb-2 block text-sm">
                    Video 🎥
                  </Label>
                  <Input
                    id="video"
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
                    <CheckCircle className="w-6 h-6 text-green-500" />
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
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedGame(null);
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
                  onClick={handleCompleteGame}
                  disabled={(!photoFile && !videoFile) || uploading}
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
                      Complete (+{selectedGame?.reward} pts)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
