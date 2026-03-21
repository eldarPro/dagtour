-- Справочник домов
CREATE TABLE IF NOT EXISTS houses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_night INTEGER NOT NULL,
  photo TEXT,
  location TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  rooms INTEGER DEFAULT 1,
  guests INTEGER DEFAULT 2,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Справочник автомобилей
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price_per_day INTEGER NOT NULL,
  photo TEXT,
  type TEXT CHECK (type IN ('эконом', 'комфорт', 'внедорожник')),
  seats INTEGER DEFAULT 5,
  transmission TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Справочник туров
CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price INTEGER NOT NULL,
  photo TEXT,
  route TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Профили пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Пользовательские автомобили
CREATE TABLE IF NOT EXISTS user_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  price_per_day INTEGER NOT NULL,
  transmission TEXT,
  description TEXT,
  address TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Пользовательские дома
CREATE TABLE IF NOT EXISTS user_houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price_per_night INTEGER NOT NULL,
  rooms INTEGER DEFAULT 1,
  guests INTEGER DEFAULT 2,
  description TEXT,
  address TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включить RLS (Row Level Security)
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_houses ENABLE ROW LEVEL SECURITY;

-- Политики для публичных таблиц (чтение для всех)
CREATE POLICY "Public read access" ON houses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cars FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tours FOR SELECT USING (true);

-- Политики для profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для user_cars
CREATE POLICY "Users can view own cars" ON user_cars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cars" ON user_cars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cars" ON user_cars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cars" ON user_cars FOR DELETE USING (auth.uid() = user_id);

-- Политики для user_houses
CREATE POLICY "Users can view own houses" ON user_houses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own houses" ON user_houses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own houses" ON user_houses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own houses" ON user_houses FOR DELETE USING (auth.uid() = user_id);

-- Триггер для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
