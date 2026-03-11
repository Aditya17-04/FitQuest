export interface AIChallenge {
  id: string;
  title: string;
  description: string;
  instruction: string;
  type: 'movement' | 'dance' | 'balance' | 'strength' | 'stretching';
  isIndoor: boolean;
  count?: number;
  reward: number;
  completed: boolean;
  generatedAt: string;
}

export interface WeatherInfo {
  temperature: number;
  description: string;
  isRaining: boolean;
}
