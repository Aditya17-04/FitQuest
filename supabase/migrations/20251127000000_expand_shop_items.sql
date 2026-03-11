-- Expand shop items with more attractive options for children
-- First, update the type constraint to include new categories
ALTER TABLE public.shop_items DROP CONSTRAINT IF EXISTS shop_items_type_check;
ALTER TABLE public.shop_items ADD CONSTRAINT shop_items_type_check 
  CHECK (type IN ('color', 'accessory', 'theme', 'animation', 'powerup', 'badge', 'sound'));

-- Clear existing items first (optional - remove this if you want to keep existing items)
DELETE FROM public.shop_items;

-- Insert comprehensive shop items
INSERT INTO public.shop_items (name, type, description, cost, preview_data) VALUES

-- Pet Colors (10 items) - Fun and vibrant colors
('Fire Dragon Red', 'color', 'Blazing red like a dragon!', 50, '{"color": "#ef4444"}'),
('Ocean Wave Blue', 'color', 'Deep blue like ocean waves', 50, '{"color": "#3b82f6"}'),
('Jungle Leaf Green', 'color', 'Bright green from the jungle', 50, '{"color": "#22c55e"}'),
('Golden Sunshine', 'color', 'Shiny golden yellow', 50, '{"color": "#eab308"}'),
('Magical Purple', 'color', 'Sparkly mystical purple', 75, '{"color": "#a855f7"}'),
('Cotton Candy Pink', 'color', 'Sweet fluffy pink', 75, '{"color": "#ec4899"}'),
('Midnight Black', 'color', 'Cool mysterious black', 60, '{"color": "#1f2937"}'),
('Snow White', 'color', 'Pure snowy white', 60, '{"color": "#f9fafb"}'),
('Chocolate Brown', 'color', 'Rich chocolate color', 55, '{"color": "#92400e"}'),
('Rainbow Sparkle', 'color', 'Changes colors like a rainbow!', 150, '{"color": "#gradient", "special": "rainbow"}'),

-- Accessories (10 items) - Fun items kids will love
('Superhero Cape', 'accessory', 'Fly like a superhero!', 120, '{"icon": "🦸", "position": "back"}'),
('Wizard Hat', 'accessory', 'Cast magical spells', 100, '{"icon": "🧙", "position": "top"}'),
('Pirate Eye Patch', 'accessory', 'Arrr, matey! Sail the seas', 80, '{"icon": "🏴‍☠️", "position": "face"}'),
('Butterfly Wings', 'accessory', 'Flutter like a butterfly', 140, '{"icon": "🦋", "position": "back"}'),
('Knight Shield', 'accessory', 'Protect and defend!', 110, '{"icon": "🛡️", "position": "hand"}'),
('Space Helmet', 'accessory', 'Explore outer space', 130, '{"icon": "👨‍🚀", "position": "head"}'),
('Flower Crown', 'accessory', 'Beautiful blooming flowers', 90, '{"icon": "🌸", "position": "top"}'),
('Star Wand', 'accessory', 'Make wishes come true', 100, '{"icon": "⭐", "position": "hand"}'),
('Birthday Party Hat', 'accessory', 'Every day is a party!', 70, '{"icon": "🎂", "position": "top"}'),
('Angel Wings', 'accessory', 'Soar through the clouds', 150, '{"icon": "😇", "position": "back"}'),

-- Themes (10 items) - Exciting backgrounds
('Outer Space', 'theme', 'Travel through galaxies!', 200, '{"gradient": "from-indigo-900 via-purple-900 to-black", "stars": true}'),
('Under the Sea', 'theme', 'Swim with fish and dolphins', 200, '{"gradient": "from-blue-400 via-cyan-500 to-teal-600", "bubbles": true}'),
('Magical Forest', 'theme', 'Enchanted woodland adventure', 200, '{"gradient": "from-green-800 via-emerald-700 to-lime-600", "leaves": true}'),
('Candy Land', 'theme', 'Sweet treats everywhere!', 220, '{"gradient": "from-pink-400 via-purple-400 to-blue-400", "candies": true}'),
('Dinosaur World', 'theme', 'Roam with the dinosaurs', 210, '{"gradient": "from-amber-700 via-orange-600 to-red-600", "dinos": true}'),
('Arctic Ice', 'theme', 'Frozen wonderland', 180, '{"gradient": "from-blue-100 via-cyan-100 to-white", "snow": true}'),
('Tropical Paradise', 'theme', 'Sunny beach vibes', 190, '{"gradient": "from-yellow-400 via-orange-400 to-pink-500", "palms": true}'),
('Volcano Adventure', 'theme', 'Hot lava and excitement!', 230, '{"gradient": "from-red-600 via-orange-600 to-yellow-500", "lava": true}'),
('Fairytale Castle', 'theme', 'Live in a magical castle', 240, '{"gradient": "from-purple-300 via-pink-300 to-blue-300", "castle": true}'),
('Rainbow Sky', 'theme', 'Colorful clouds and rainbows', 250, '{"gradient": "from-red-400 via-yellow-400 to-purple-400", "rainbow": true}'),

-- Animations (10 items) - Cool movements
('Happy Dance', 'animation', 'Dance with joy!', 100, '{"animation": "bounce"}'),
('Sparkle Magic', 'animation', 'Leave sparkly trails', 120, '{"animation": "sparkle"}'),
('Super Jump', 'animation', 'Jump super high!', 80, '{"animation": "jump"}'),
('Victory Spin', 'animation', 'Spin around in celebration', 90, '{"animation": "spin"}'),
('Wiggle Wiggle', 'animation', 'Silly wiggle dance', 70, '{"animation": "wiggle"}'),
('Star Shower', 'animation', 'Stars fall around you', 130, '{"animation": "stars"}'),
('Heart Float', 'animation', 'Hearts float upward', 110, '{"animation": "hearts"}'),
('Rainbow Trail', 'animation', 'Leave a rainbow behind', 140, '{"animation": "rainbow"}'),
('Bubble Pop', 'animation', 'Pop bubbles everywhere', 95, '{"animation": "bubbles"}'),
('Lightning Zap', 'animation', 'Electric energy!', 150, '{"animation": "lightning"}'),

-- Power-ups (New category for gameplay enhancement)
('Double Points', 'powerup', 'Earn 2x points for 1 hour!', 300, '{"effect": "double_points", "duration": 3600}'),
('Energy Boost', 'powerup', 'Extra energy for challenges', 250, '{"effect": "energy_boost", "amount": 50}'),
('Time Freeze', 'powerup', 'Pause screen time for 10 mins', 400, '{"effect": "time_freeze", "duration": 600}'),
('Lucky Star', 'powerup', 'Random bonus rewards', 200, '{"effect": "lucky", "multiplier": 1.5}'),
('Speed Rush', 'powerup', 'Complete activities faster', 280, '{"effect": "speed", "bonus": 25}'),

-- Badges (New category for achievements)
('Champion Badge', 'badge', 'You are a true champion!', 150, '{"icon": "🏆", "rarity": "gold"}'),
('Explorer Badge', 'badge', 'Completed all adventures', 120, '{"icon": "🗺️", "rarity": "silver"}'),
('Fitness Master', 'badge', '100 activities completed', 180, '{"icon": "💪", "rarity": "gold"}'),
('Nature Lover', 'badge', 'Outdoor activity expert', 100, '{"icon": "🌳", "rarity": "bronze"}'),
('Team Player', 'badge', 'Great family activities', 110, '{"icon": "👨‍👩‍👧", "rarity": "silver"}'),

-- Fun Sounds (New category)
('Celebration Cheer', 'sound', 'Hear cheers when you win!', 80, '{"sound": "cheer", "trigger": "complete"}'),
('Victory Trumpet', 'sound', 'Triumphant music!', 90, '{"sound": "trumpet", "trigger": "complete"}'),
('Magic Sparkle', 'sound', 'Magical sound effects', 70, '{"sound": "sparkle", "trigger": "action"}'),
('Applause', 'sound', 'Everyone claps for you!', 85, '{"sound": "clap", "trigger": "complete"}'),
('Drum Roll', 'sound', 'Exciting drum sounds', 75, '{"sound": "drums", "trigger": "start"}');
