-- Разрешить NULL в selected_option для опросов с пользовательскими вариантами
-- Временно устанавливаем значение по умолчанию для существующих записей
UPDATE poll_responses SET selected_option = 0 WHERE selected_option IS NULL;

-- Меняем тип колонки, убирая ограничение NOT NULL
ALTER TABLE poll_responses ALTER COLUMN selected_option TYPE integer USING selected_option::integer;
