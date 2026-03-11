import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeData {
  gradient: string;
  background: string;
  special?: string;
}

const themeConfigs: Record<string, ThemeData> = {
  'default': {
    gradient: 'from-primary/30 via-secondary/30 to-accent/30',
    background: 'adventure-page-background',
  },
  // Outer Space
  'outer-space': {
    gradient: 'from-indigo-900 via-purple-900 to-black',
    background: 'bg-gradient-to-br',
    special: 'stars',
  },
  // Under the Sea
  'under-the-sea': {
    gradient: 'from-blue-400 via-cyan-500 to-teal-600',
    background: 'bg-gradient-to-br',
    special: 'bubbles',
  },
  // Magical Forest
  'magical-forest': {
    gradient: 'from-green-800 via-emerald-700 to-lime-600',
    background: 'bg-gradient-to-br',
    special: 'leaves',
  },
  // Candy Land
  'candy-land': {
    gradient: 'from-pink-400 via-purple-400 to-blue-400',
    background: 'bg-gradient-to-br',
    special: 'candies',
  },
  // Dinosaur World
  'dinosaur-world': {
    gradient: 'from-amber-700 via-orange-600 to-red-600',
    background: 'bg-gradient-to-br',
    special: 'dinos',
  },
  // Arctic Ice
  'arctic-ice': {
    gradient: 'from-blue-100 via-cyan-100 to-white',
    background: 'bg-gradient-to-br',
    special: 'snow',
  },
  // Tropical Paradise
  'tropical-paradise': {
    gradient: 'from-yellow-400 via-orange-400 to-pink-500',
    background: 'bg-gradient-to-br',
    special: 'palms',
  },
  // Volcano Adventure
  'volcano-adventure': {
    gradient: 'from-red-600 via-orange-600 to-yellow-500',
    background: 'bg-gradient-to-br',
    special: 'lava',
  },
  // Fairytale Castle
  'fairytale-castle': {
    gradient: 'from-purple-300 via-pink-300 to-blue-300',
    background: 'bg-gradient-to-br',
    special: 'castle',
  },
  // Rainbow Sky
  'rainbow-sky': {
    gradient: 'from-red-400 via-yellow-400 to-purple-400',
    background: 'bg-gradient-to-br',
    special: 'rainbow',
  },
};

export const useTheme = (childId: string | null) => {
  const [activeTheme, setActiveTheme] = useState<string>('default');
  const [themeConfig, setThemeConfig] = useState<ThemeData>(themeConfigs['default']);

  useEffect(() => {
    if (!childId) return;

    const fetchTheme = async () => {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('active_theme')
        .eq('id', childId)
        .single();

      if (error) {
        console.error('Error fetching theme:', error);
        return;
      }

      const theme = data?.active_theme || 'default';
      setActiveTheme(theme);
      
      // Find matching theme by checking if shop item name matches
      const themeKey = Object.keys(themeConfigs).find(key => 
        theme.includes(key) || key.includes(theme.toLowerCase().replace(/\s+/g, '-'))
      ) || 'default';
      
      setThemeConfig(themeConfigs[themeKey]);
    };

    fetchTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'child_profiles',
          filter: `id=eq.${childId}`,
        },
        (payload) => {
          const theme = payload.new.active_theme || 'default';
          setActiveTheme(theme);
          
          const themeKey = Object.keys(themeConfigs).find(key => 
            theme.includes(key) || key.includes(theme.toLowerCase().replace(/\s+/g, '-'))
          ) || 'default';
          
          setThemeConfig(themeConfigs[themeKey]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const getBackgroundClasses = () => {
    if (themeConfig.background === 'adventure-page-background') {
      return 'adventure-page-background';
    }
    return `${themeConfig.background} ${themeConfig.gradient}`;
  };

  const getOverlayClasses = () => {
    // Return overlay gradient for themed backgrounds
    if (themeConfig.background === 'adventure-page-background') {
      return 'bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 backdrop-blur-sm';
    }
    return 'bg-black/10 backdrop-blur-sm';
  };

  return {
    activeTheme,
    themeConfig,
    getBackgroundClasses,
    getOverlayClasses,
  };
};
