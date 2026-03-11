import { useState, useEffect } from 'react';
import { UserProgress, Pet, ParentSettings } from '@/types/adventure';
import { chapters } from '@/data/chapters';

const DEFAULT_PET: Pet = {
  name: 'Sparkle',
  health: 100,
  happiness: 100,
  energy: 100,
  level: 1,
};

const DEFAULT_SETTINGS: ParentSettings = {
  childName: 'Adventurer',
  childAge: 7,
  hasBackyard: false,
  apartmentSize: 'medium',
  screenTimeLimit: 30,
};

const DEFAULT_PROGRESS: UserProgress = {
  currentChapter: 1,
  totalPoints: 0,
  completedActivities: [],
  pet: DEFAULT_PET,
  screenTimeToday: 0,
  lastActivityDate: new Date().toISOString().split('T')[0],
};

export const useAdventureProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('adventureProgress');
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  });

  const [settings, setSettings] = useState<ParentSettings>(() => {
    const saved = localStorage.getItem('parentSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('adventureProgress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('parentSettings', JSON.stringify(settings));
  }, [settings]);

  // Check if it's a new day and reset screen time
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastActivityDate !== today) {
      setProgress(prev => ({
        ...prev,
        screenTimeToday: 0,
        lastActivityDate: today,
      }));
    }
  }, []);

  const completeActivity = (activityId: string, points: number) => {
    setProgress(prev => {
      const newCompletedActivities = [...prev.completedActivities, activityId];
      const newTotalPoints = prev.totalPoints + points;
      
      // Update pet stats
      const newPet = {
        ...prev.pet,
        health: Math.min(100, prev.pet.health + 5),
        happiness: Math.min(100, prev.pet.happiness + 10),
        energy: Math.min(100, prev.pet.energy + 8),
      };

      // Check if current chapter is completed
      const currentChapterData = chapters.find(ch => ch.id === prev.currentChapter);
      const allActivitiesComplete = currentChapterData?.activities.every(
        act => newCompletedActivities.includes(act.id)
      );

      const newChapter = allActivitiesComplete ? prev.currentChapter + 1 : prev.currentChapter;

      return {
        ...prev,
        completedActivities: newCompletedActivities,
        totalPoints: newTotalPoints,
        currentChapter: newChapter,
        pet: newPet,
      };
    });
  };

  const updateScreenTime = (minutes: number) => {
    setProgress(prev => ({
      ...prev,
      screenTimeToday: prev.screenTimeToday + minutes,
    }));
  };

  const updateSettings = (newSettings: Partial<ParentSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    localStorage.removeItem('adventureProgress');
  };

  const isScreenTimeLocked = () => {
    return progress.screenTimeToday >= settings.screenTimeLimit;
  };

  return {
    progress,
    settings,
    completeActivity,
    updateScreenTime,
    updateSettings,
    resetProgress,
    isScreenTimeLocked,
  };
};
