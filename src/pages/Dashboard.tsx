import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useChildProfiles } from '@/hooks/useChildProfiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LogOut, Plus, Play, Settings, Trash2 } from 'lucide-react';
import mascotImage from '@/assets/mascot-fox.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { children, loading: childrenLoading, createChild, deleteChild } = useChildProfiles();

  const [showAddChild, setShowAddChild] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [playSpace, setPlaySpace] = useState<string>('medium_apartment');

  // Parent settings
  const [parentName, setParentName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [dailyActivityTime, setDailyActivityTime] = useState('60');
  const [screenTimeLimit, setScreenTimeLimit] = useState('30');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setParentName(profile.parent_name);
      setTimezone(profile.timezone);
      setDailyActivityTime(profile.daily_activity_time.toString());
      setScreenTimeLimit(profile.screen_time_limit.toString());
    }
  }, [profile]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await createChild({
      child_name: childName,
      child_age: parseInt(childAge),
      play_space: playSpace as any,
    });

    if (error) {
      toast.error('Failed to add child profile');
    } else {
      toast.success(`${childName}'s profile created!`);
      setShowAddChild(false);
      setChildName('');
      setChildAge('');
      setPlaySpace('medium_apartment');
    }
  };

  const handleDeleteChild = async (childId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s profile?`)) return;

    const { error } = await deleteChild(childId);

    if (error) {
      toast.error('Failed to delete profile');
    } else {
      toast.success(`${name}'s profile deleted`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await updateProfile({
      parent_name: parentName,
      timezone,
      daily_activity_time: parseInt(dailyActivityTime),
      screen_time_limit: parseInt(screenTimeLimit),
    });

    if (error) {
      toast.error('Failed to update settings');
    } else {
      toast.success('Settings updated!');
      setShowSettings(false);
    }
  };

  const handlePlayMode = (childId: string) => {
    localStorage.setItem('activeChildId', childId);
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || profileLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <img src={mascotImage} alt="Loading" className="w-24 h-24 mx-auto mb-4 animate-bounce" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Parent Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.parent_name}!</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Parent Settings</DialogTitle>
                  <DialogDescription>Update your family preferences</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-name">Your Name</Label>
                    <Input
                      id="parent-name"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="e.g., America/New_York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-time">Daily Activity Goal (minutes)</Label>
                    <Input
                      id="activity-time"
                      type="number"
                      value={dailyActivityTime}
                      onChange={(e) => setDailyActivityTime(e.target.value)}
                      min="15"
                      max="240"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screen-time">Screen Time Limit (minutes)</Label>
                    <Input
                      id="screen-time"
                      type="number"
                      value={screenTimeLimit}
                      onChange={(e) => setScreenTimeLimit(e.target.value)}
                      min="10"
                      max="120"
                    />
                  </div>
                  <Button type="submit" className="w-full">Save Settings</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle>{child.child_name}</CardTitle>
                <CardDescription>{child.child_age} years old</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Chapter:</strong> {child.current_chapter}</p>
                  <p><strong>Points:</strong> {child.total_points}</p>
                  <p><strong>Pet Level:</strong> {child.pet_level}</p>
                  <p><strong>Play Space:</strong> {child.play_space.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handlePlayMode(child.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Mode
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteChild(child.id, child.child_name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:border-primary transition-colors flex items-center justify-center min-h-[200px]">
                <CardContent className="text-center">
                  <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <CardTitle>Add Child Profile</CardTitle>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Child Profile</DialogTitle>
                <DialogDescription>Create a profile for your child</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddChild} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Child's Name</Label>
                  <Input
                    id="child-name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-age">Age</Label>
                  <Input
                    id="child-age"
                    type="number"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    min="3"
                    max="12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="play-space">Play Space</Label>
                  <Select value={playSpace} onValueChange={setPlaySpace}>
                    <SelectTrigger id="play-space">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small_apartment">Small Apartment</SelectItem>
                      <SelectItem value="medium_apartment">Medium Apartment</SelectItem>
                      <SelectItem value="large_apartment">Large Apartment</SelectItem>
                      <SelectItem value="backyard">House with Backyard</SelectItem>
                      <SelectItem value="outdoor">Outdoor/Park Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create Profile</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
