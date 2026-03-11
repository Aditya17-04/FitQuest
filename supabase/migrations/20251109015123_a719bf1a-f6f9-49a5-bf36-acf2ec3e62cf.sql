-- Create profiles table for parents
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  daily_activity_time INTEGER DEFAULT 60, -- minutes per day
  screen_time_limit INTEGER DEFAULT 30, -- minutes per day
  weather_access_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create child_profiles table
CREATE TABLE public.child_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  play_space TEXT NOT NULL CHECK (play_space IN ('small_apartment', 'medium_apartment', 'large_apartment', 'backyard', 'outdoor')),
  current_chapter INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  completed_activities TEXT[] DEFAULT '{}',
  pet_name TEXT DEFAULT 'Sparkle',
  pet_health INTEGER DEFAULT 100,
  pet_happiness INTEGER DEFAULT 100,
  pet_energy INTEGER DEFAULT 100,
  pet_level INTEGER DEFAULT 1,
  screen_time_today INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (parents can only see/edit their own profile)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Child profiles policies (parents can manage their children)
CREATE POLICY "Parents can view their children"
  ON public.child_profiles FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their children"
  ON public.child_profiles FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their children"
  ON public.child_profiles FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their children"
  ON public.child_profiles FOR DELETE
  USING (auth.uid() = parent_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW    
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, parent_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();