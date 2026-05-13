-- Таблица для хранения мета-значений (макс. цены)
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL DEFAULT 0
);

-- Инициализация текущими максимумами
INSERT INTO meta (key, value) VALUES
  ('cars_max_price',   COALESCE((SELECT MAX(price_per_day)   FROM cars),   0)),
  ('houses_max_price', COALESCE((SELECT MAX(price_per_night) FROM houses), 0)),
  ('tours_max_price',  COALESCE((SELECT MAX(price)           FROM tours),  0))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- === CARS ===
CREATE OR REPLACE FUNCTION trg_cars_max_price()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE meta SET value = COALESCE((SELECT MAX(price_per_day) FROM cars), 0)
    WHERE key = 'cars_max_price';
    RETURN OLD;
  ELSE
    UPDATE meta SET value = GREATEST(value, NEW.price_per_day)
    WHERE key = 'cars_max_price';
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cars_max_price_trigger ON cars;
CREATE TRIGGER cars_max_price_trigger
AFTER INSERT OR UPDATE OF price_per_day OR DELETE ON cars
FOR EACH ROW EXECUTE FUNCTION trg_cars_max_price();

-- === HOUSES ===
CREATE OR REPLACE FUNCTION trg_houses_max_price()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE meta SET value = COALESCE((SELECT MAX(price_per_night) FROM houses), 0)
    WHERE key = 'houses_max_price';
    RETURN OLD;
  ELSE
    UPDATE meta SET value = GREATEST(value, NEW.price_per_night)
    WHERE key = 'houses_max_price';
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS houses_max_price_trigger ON houses;
CREATE TRIGGER houses_max_price_trigger
AFTER INSERT OR UPDATE OF price_per_night OR DELETE ON houses
FOR EACH ROW EXECUTE FUNCTION trg_houses_max_price();

-- === TOURS ===
CREATE OR REPLACE FUNCTION trg_tours_max_price()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE meta SET value = COALESCE((SELECT MAX(price) FROM tours), 0)
    WHERE key = 'tours_max_price';
    RETURN OLD;
  ELSE
    UPDATE meta SET value = GREATEST(value, NEW.price)
    WHERE key = 'tours_max_price';
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tours_max_price_trigger ON tours;
CREATE TRIGGER tours_max_price_trigger
AFTER INSERT OR UPDATE OF price OR DELETE ON tours
FOR EACH ROW EXECUTE FUNCTION trg_tours_max_price();
