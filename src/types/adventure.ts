export interface Activity {
  id: string;
  type: 'movement' | 'object-hunt' | 'nature' | 'parent-child';
  title: string;
  description: string;
  instruction: string;
  count?: number;
  reward: number;
  completed: boolean;
  photoUrl?: string;
  videoUrl?: string;
}

export interface Chapter {
  id: number;
  title: string;
  story: string;
  mascotMessages?: string[];
  activities: Activity[];
  unlocked: boolean;
  completed: boolean;
}

export interface Pet {
  name: string;
  health: number;
  happiness: number;
  energy: number;
  level: number;
}

export interface UserProgress {
  currentChapter: number;
  totalPoints: number;
  completedActivities: string[];
  pet: Pet;
  screenTimeToday: number;
  lastActivityDate: string;
}

export interface ParentSettings {
  childName: string;
  childAge: number;
  hasBackyard: boolean;
  apartmentSize: 'small' | 'medium' | 'large';
  screenTimeLimit: number; // in minutes
  childId?: string;
}
