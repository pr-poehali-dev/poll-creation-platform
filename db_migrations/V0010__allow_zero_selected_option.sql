-- Обновляем check constraint для selected_option
-- Теперь разрешаем значение 0 (для опросов с пользовательскими вариантами)
-- и значения 1-10 (для обычных опросов)

ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_selected_option_check;
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_selected_option_range;

ALTER TABLE poll_responses ADD CONSTRAINT poll_responses_selected_option_check 
CHECK (selected_option >= 0 AND selected_option <= 10);
