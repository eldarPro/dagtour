-- Добавить колонку photos (массив URL) в таблицы объявлений
ALTER TABLE cars ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE houses ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Создать bucket для фото объявлений (публичный)
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-photos', 'announcement-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage: публичный просмотр
CREATE POLICY "Public read announcement photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-photos');

-- Политики для storage: авторизованные пользователи могут загружать
CREATE POLICY "Authenticated upload announcement photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'announcement-photos');

-- Политики для storage: авторизованные пользователи могут удалять
CREATE POLICY "Authenticated delete announcement photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'announcement-photos');
