-- Create storage bucket for challenge videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-videos', 'challenge-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for challenge videos storage
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view challenge videos'
  ) THEN
    CREATE POLICY "Anyone can view challenge videos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'challenge-videos');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload challenge videos'
  ) THEN
    CREATE POLICY "Authenticated users can upload challenge videos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'challenge-videos' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own challenge videos'
  ) THEN
    CREATE POLICY "Users can update their own challenge videos"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'challenge-videos' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own challenge videos'
  ) THEN
    CREATE POLICY "Users can delete their own challenge videos"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'challenge-videos' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Add video_url, activity_type, and activity_name columns to challenge_completions table
ALTER TABLE public.challenge_completions 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS activity_type text,
ADD COLUMN IF NOT EXISTS activity_name text;

-- Add check constraint for activity_type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'challenge_completions_activity_type_check'
  ) THEN
    ALTER TABLE public.challenge_completions 
    ADD CONSTRAINT challenge_completions_activity_type_check 
    CHECK (activity_type IN ('story', 'ai', 'family'));
  END IF;
END $$;

-- Create index for activity_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_challenge_completions_activity_type ON public.challenge_completions(activity_type);
