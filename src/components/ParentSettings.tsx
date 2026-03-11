import { useState } from 'react';
import { ParentSettings as ParentSettingsType } from '@/types/adventure';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface ParentSettingsProps {
  settings: ParentSettingsType;
  onUpdate: (settings: Partial<ParentSettingsType>) => void;
}

export const ParentSettings = ({ settings, onUpdate }: ParentSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    onUpdate(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full shadow-md">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Parent Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="childName">Child's Name</Label>
            <Input
              id="childName"
              value={formData.childName}
              onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              placeholder="Enter child's name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="childAge">Child's Age</Label>
            <Input
              id="childAge"
              type="number"
              min="3"
              max="12"
              value={formData.childAge}
              onChange={(e) => setFormData({ ...formData, childAge: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenTimeLimit">Screen Time Limit (minutes)</Label>
            <Input
              id="screenTimeLimit"
              type="number"
              min="10"
              max="120"
              step="5"
              value={formData.screenTimeLimit}
              onChange={(e) => setFormData({ ...formData, screenTimeLimit: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              After this time, the app will lock and encourage outdoor play
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apartmentSize">Living Space</Label>
            <Select
              value={formData.apartmentSize}
              onValueChange={(value: 'small' | 'medium' | 'large') => 
                setFormData({ ...formData, apartmentSize: value })
              }
            >
              <SelectTrigger id="apartmentSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small Apartment</SelectItem>
                <SelectItem value="medium">Medium House</SelectItem>
                <SelectItem value="large">Large House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hasBackyard">Has Backyard/Outdoor Space</Label>
              <p className="text-xs text-muted-foreground">
                For nature-based activities
              </p>
            </div>
            <Switch
              id="hasBackyard"
              checked={formData.hasBackyard}
              onCheckedChange={(checked) => setFormData({ ...formData, hasBackyard: checked })}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-gradient-adventure text-white">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
