-- Create shop_items table for all purchasable items
CREATE TABLE public.shop_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('accessory', 'color', 'theme', 'animation')),
  description text NOT NULL,
  cost integer NOT NULL CHECK (cost > 0),
  image_url text,
  preview_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create child_purchases table to track what children have bought
CREATE TABLE public.child_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  shop_item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id, shop_item_id)
);

-- Add customization columns to child_profiles
ALTER TABLE public.child_profiles
ADD COLUMN active_pet_color text DEFAULT 'orange',
ADD COLUMN active_theme text DEFAULT 'default',
ADD COLUMN active_accessories text[] DEFAULT '{}',
ADD COLUMN active_animation text DEFAULT 'default';

-- Enable RLS
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_purchases ENABLE ROW LEVEL SECURITY;

-- Shop items are viewable by everyone
CREATE POLICY "Shop items are viewable by everyone"
ON public.shop_items
FOR SELECT
USING (true);

-- Parents can view their children's purchases
CREATE POLICY "Parents can view their children's purchases"
ON public.child_purchases
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM child_profiles
  WHERE child_profiles.id = child_purchases.child_id
  AND child_profiles.parent_id = auth.uid()
));

-- Parents can insert purchases for their children
CREATE POLICY "Parents can insert purchases for their children"
ON public.child_purchases
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM child_profiles
  WHERE child_profiles.id = child_purchases.child_id
  AND child_profiles.parent_id = auth.uid()
));

-- Insert starter shop items
INSERT INTO public.shop_items (name, type, description, cost, preview_data) VALUES
-- Pet Colors
('Ruby Red', 'color', 'A vibrant red color for your pet', 50, '{"color": "#ef4444"}'),
('Ocean Blue', 'color', 'Cool blue like the ocean', 50, '{"color": "#3b82f6"}'),
('Forest Green', 'color', 'Fresh green from the forest', 50, '{"color": "#22c55e"}'),
('Sunshine Yellow', 'color', 'Bright and cheerful yellow', 50, '{"color": "#eab308"}'),
('Purple Magic', 'color', 'Mystical purple shade', 75, '{"color": "#a855f7"}'),
('Pink Dream', 'color', 'Soft dreamy pink', 75, '{"color": "#ec4899"}'),

-- Accessories
('Star Crown', 'accessory', 'A sparkling crown fit for a champion', 100, '{"icon": "👑", "position": "top"}'),
('Cool Sunglasses', 'accessory', 'Stay cool with these shades', 80, '{"icon": "🕶️", "position": "face"}'),
('Magic Wand', 'accessory', 'Cast spells of fun', 120, '{"icon": "🪄", "position": "hand"}'),
('Rainbow Wings', 'accessory', 'Fly high with rainbow wings', 150, '{"icon": "🦋", "position": "back"}'),
('Party Hat', 'accessory', 'Always ready to celebrate', 60, '{"icon": "🎉", "position": "top"}'),

-- Themes
('Space Adventure', 'theme', 'Explore the cosmos', 200, '{"gradient": "from-indigo-900 via-purple-900 to-black", "stars": true}'),
('Underwater World', 'theme', 'Dive into the ocean', 200, '{"gradient": "from-blue-400 via-cyan-500 to-teal-600", "bubbles": true}'),
('Enchanted Forest', 'theme', 'Magical woodland realm', 200, '{"gradient": "from-green-800 via-emerald-700 to-lime-600", "leaves": true}'),
('Sunset Paradise', 'theme', 'Golden hour vibes', 150, '{"gradient": "from-orange-400 via-pink-500 to-purple-600"}'),

-- Animations
('Dance Party', 'animation', 'Your pet does a victory dance', 100, '{"animation": "bounce"}'),
('Sparkle Trail', 'animation', 'Leaves sparkles everywhere', 120, '{"animation": "sparkle"}'),
('Super Jump', 'animation', 'Jump extra high!', 80, '{"animation": "jump"}'),
('Spin Master', 'animation', 'Spin around with joy', 90, '{"animation": "spin"}')