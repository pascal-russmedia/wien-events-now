
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  subregion TEXT,
  address TEXT,
  link TEXT,
  host TEXT,
  dates JSONB NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'free',
  price_amount DECIMAL(10,2),
  image TEXT,
  state TEXT NOT NULL DEFAULT 'Pending',
  added_by TEXT NOT NULL,
  added_by_email TEXT NOT NULL,
  trust_score INTEGER NOT NULL DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for events
CREATE POLICY "Anyone can view approved events" ON public.events
  FOR SELECT USING (state = 'Approved');

CREATE POLICY "Anyone can insert events" ON public.events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all events" ON public.events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update events" ON public.events
  FOR UPDATE TO authenticated USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
