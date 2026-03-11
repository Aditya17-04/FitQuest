export interface Profile {
  id: string;
  parent_name: string;
  email: string;
  timezone: string;
  daily_activity_time: number;
  screen_time_limit: number;
  weather_access_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChildProfile {
  id: string;
  parent_id: string;
  child_name: string;
  child_age: number;
  play_space: 'small_apartment' | 'medium_apartment' | 'large_apartment' | 'backyard' | 'outdoor';
  current_chapter: number;
  total_points: number;
  completed_activities: string[];
  pet_name: string;
  pet_health: number;
  pet_happiness: number;
  pet_energy: number;
  pet_level: number;
  screen_time_today: number;
  last_activity_date: string;
  badges: string[];
  created_at: string;
  updated_at: string;
}
