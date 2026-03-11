import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePhotoGallery } from '@/hooks/usePhotoGallery';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Calendar, Camera, Download, X, Play, ChevronLeft, ChevronRight, Filter, Share2, Users } from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import mascotImage from '@/assets/mascot-fox.png';

export default function PhotoGallery() {
  const navigate = useNavigate();
  const { photos, loading, groupedByDate, groupedByType } = usePhotoGallery();
  const activeChildId = localStorage.getItem('activeChildId');
  const { getBackgroundClasses, getOverlayClasses } = useTheme(activeChildId);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Filter photos based on activity type and date range
  const filteredPhotos = photos.filter(photo => {
    // Activity type filter
    if (activityFilter !== 'all' && photo.activity_type !== activityFilter) {
      return false;
    }

    // Date range filter
    if (dateRange !== 'all') {
      const photoDate = new Date(photo.completed_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateRange) {
        case 'today':
          const photoDay = new Date(photoDate.getFullYear(), photoDate.getMonth(), photoDate.getDate());
          return photoDay.getTime() === today.getTime();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return photoDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setDate(today.getDate() - 30);
          return photoDate >= monthAgo;
        default:
          return true;
      }
    }

    return true;
  });

  const startSlideshow = () => {
    if (filteredPhotos.length > 0) {
      setCurrentSlideIndex(0);
      setSelectedPhoto(filteredPhotos[0]);
      setIsSlideshow(true);
    }
  };

  const nextSlide = () => {
    const nextIndex = (currentSlideIndex + 1) % filteredPhotos.length;
    setCurrentSlideIndex(nextIndex);
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  const previousSlide = () => {
    const prevIndex = currentSlideIndex === 0 ? filteredPhotos.length - 1 : currentSlideIndex - 1;
    setCurrentSlideIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
  };

  const sharePhoto = async (photoUrl: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'activity-photo.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          files: [file],
          title: 'FitQuest Activity Photo',
          text: 'Check out my FitQuest activity!',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const downloadPhoto = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundClasses()}`}>
        <div className={`min-h-screen ${getOverlayClasses()} flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading photo gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundClasses()}`}>
      <div className={`min-h-screen ${getOverlayClasses()}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div id="gallery-top" className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground drop-shadow-lg">
                📸 Photo Gallery
              </h1>
              <p className="text-muted-foreground mt-2">
                Your amazing adventure memories! 🎥✨
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Adventure
              </Button>
              <Button
                onClick={() => navigate('/parent-child-games')}
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Family
              </Button>
            </div>
          </div>

          {/* Gallery Content */}
          <div className="bg-background/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
            <div className="flex gap-2 mb-6">
              <Badge variant="secondary">
                <Camera className="w-3 h-3 mr-1" />
                {filteredPhotos.length} Items
              </Badge>
              {filteredPhotos.length > 0 && (
                <Button size="sm" variant="outline" onClick={startSlideshow}>
                  <Play className="w-3 h-3 mr-1" />
                  Slideshow
                </Button>
              )}
            </div>

            {/* Filters */}
            <div id="filters" className="flex flex-wrap gap-4 mb-6 p-4 bg-background/50 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="story">Story Adventures</SelectItem>
                <SelectItem value="ai">AI Challenges</SelectItem>
                <SelectItem value="family">Family Activities</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            {(activityFilter !== 'all' || dateRange !== 'all') && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setActivityFilter('all');
                  setDateRange('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Gallery Tabs */}
          <Tabs defaultValue="date" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="date">
              <Calendar className="w-4 h-4 mr-2" />
              By Date
            </TabsTrigger>
            <TabsTrigger value="type">
              <Camera className="w-4 h-4 mr-2" />
              By Activity Type
            </TabsTrigger>
          </TabsList>

          {/* By Date View */}
          <TabsContent value="date" className="space-y-8">
            {filteredPhotos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {photos.length === 0 
                      ? 'No photos or videos yet! Complete activities to start your collection.'
                      : 'No items match your filters. Try adjusting the filters above.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(
                filteredPhotos.reduce((acc: any, photo) => {
                  const date = format(new Date(photo.completed_at), 'yyyy-MM-dd');
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(photo);
                  return acc;
                }, {})
              )
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, datePhotos]: [string, any]) => (
                  <div key={date} id={`date-${date}`}>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <a href={`#date-${date}`} className="hover:opacity-70 transition-opacity" aria-label={`Link to ${format(new Date(date), 'MMMM d, yyyy')}`}>
                        <Calendar className="w-6 h-6" />
                      </a>
                      {format(new Date(date), 'MMMM d, yyyy')}
                      <Badge variant="outline">{datePhotos.length} photos</Badge>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {datePhotos.map((photo: any) => (
                        <div key={photo.id} id={`photo-${photo.id}`}>
                          <PhotoCard
                            photo={photo}
                            onClick={() => {
                              setSelectedPhoto(photo);
                              setCurrentSlideIndex(filteredPhotos.findIndex(p => p.id === photo.id));
                              window.location.hash = `photo-${photo.id}`;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </TabsContent>

          {/* By Activity Type View */}
          <TabsContent value="type" className="space-y-8">
            {filteredPhotos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {photos.length === 0 
                      ? 'No photos or videos yet! Complete activities to start your collection.'
                      : 'No items match your filters. Try adjusting the filters above.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(
                filteredPhotos.reduce((acc: any, photo) => {
                  const type = photo.activity_type || 'other';
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(photo);
                  return acc;
                }, {})
              ).map(([type, typePhotos]: [string, any]) => (
                <div key={type} id={`type-${type}`}>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <a href={`#type-${type}`} className="hover:opacity-70 transition-opacity" aria-label={`Link to ${getActivityLabel(type)}`}>
                      {getActivityIcon(type)}
                    </a>
                    {getActivityLabel(type)}
                    <Badge variant="outline">{typePhotos.length} photos</Badge>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {typePhotos.map((photo: any) => (
                      <div key={photo.id} id={`photo-${photo.id}`}>
                        <PhotoCard
                          photo={photo}
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setCurrentSlideIndex(filteredPhotos.findIndex(p => p.id === photo.id));
                            window.location.hash = `photo-${photo.id}`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
        </div>

        {/* Lightbox/Slideshow Dialog */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => {
          setSelectedPhoto(null);
          setIsSlideshow(false);
        }}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            {selectedPhoto && (
              <div className="relative">
                {/* Navigation Buttons for Slideshow */}
                {isSlideshow && filteredPhotos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                      onClick={previousSlide}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    setSelectedPhoto(null);
                    setIsSlideshow(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
                
                {selectedPhoto.photo_url ? (
                  <img
                    src={selectedPhoto.photo_url}
                    alt={selectedPhoto.activity_name || 'Activity photo'}
                    className="w-full h-auto max-h-[80vh] object-contain bg-black"
                  />
                ) : selectedPhoto.video_url ? (
                  <video
                    src={selectedPhoto.video_url}
                    controls
                    className="w-full h-auto max-h-[80vh] object-contain bg-black"
                  />
                ) : null}
                
                <div className="p-6 bg-background">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {selectedPhoto.activity_name || 'Activity'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedPhoto.completed_at), 'MMMM d, yyyy \'at\' h:mm a')}
                      </p>
                      {isSlideshow && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Photo {currentSlideIndex + 1} of {filteredPhotos.length}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      +{selectedPhoto.points_awarded} pts
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadPhoto(
                        selectedPhoto.photo_url || selectedPhoto.video_url,
                        `activity-${format(new Date(selectedPhoto.completed_at), 'yyyy-MM-dd')}.${selectedPhoto.photo_url ? 'jpg' : 'mp4'}`
                      )}
                      className="flex-1"
                      disabled={!selectedPhoto.photo_url && !selectedPhoto.video_url}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    {navigator.share && selectedPhoto.photo_url && (
                      <Button
                        onClick={() => sharePhoto(selectedPhoto.photo_url)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}

const PhotoCard = ({ photo, onClick }: { photo: any; onClick: () => void }) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-float w-full"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square w-full">
          {photo.photo_url ? (
            <img
              src={photo.photo_url}
              alt={photo.activity_name || 'Activity'}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          ) : photo.video_url ? (
            <>
              <video
                src={photo.video_url}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-12 h-12 text-white" />
              </div>
            </>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-semibold text-sm truncate">
                {photo.activity_name || 'Activity'}
              </p>
              <p className="text-white/80 text-xs">
                {format(new Date(photo.completed_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 shadow-lg"
          >
            +{photo.points_awarded}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const getActivityIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    'story': '📖',
    'ai': '✨',
    'family': '👨‍👩‍👧',
    'other': '🎯'
  };
  return <span className="text-2xl">{icons[type] || icons.other}</span>;
};

const getActivityLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    'story': 'Story Adventures',
    'ai': 'AI Challenges',
    'family': 'Family Activities',
    'other': 'Other Activities'
  };
  return labels[type] || labels.other;
};
