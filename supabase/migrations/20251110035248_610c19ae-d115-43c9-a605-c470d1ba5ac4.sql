-- Create storage bucket for challenge photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-photos', 'challenge-photos', true);

-- Create policies for challenge photos storage
CREATE POLICY "Anyone can view challenge photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'challenge-photos');

CREATE POLICY "Authenticated users can upload challenge photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'challenge-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own challenge photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'challenge-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own challenge photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'challenge-photos' 
  AND auth.role() = 'authenticated'
);

-- Create challenge_completions table to track photo evidence
CREATE TABLE public.challenge_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  challenge_id text NOT NULL,
  photo_url text,
  duration_seconds integer NOT NULL DEFAULT 0,
  points_awarded integer NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on challenge_completions
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_completions
CREATE POLICY "Parents can view their children's completions"
ON public.challenge_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE child_profiles.id = challenge_completions.child_id
    AND child_profiles.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can insert completions for their children"
ON public.challenge_completions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE child_profiles.id = challenge_completions.child_id
    AND child_profiles.parent_id = auth.uid()
  )
);

-- Add index for faster queries
CREATE INDEX idx_challenge_completions_child_id ON public.challenge_completions(child_id);
CREATE INDEX idx_challenge_completions_completed_at ON public.challenge_completions(completed_at);