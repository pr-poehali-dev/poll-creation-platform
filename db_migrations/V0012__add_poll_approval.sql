-- Добавляем поле для модерации опросов
ALTER TABLE polls ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Все существующие опросы считаем одобренными
UPDATE polls SET is_approved = true WHERE is_active = true;