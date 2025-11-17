-- Удаляем существующий check constraint для selected_option
ALTER TABLE poll_responses DROP CONSTRAINT IF EXISTS poll_responses_selected_option_check;

-- Устанавливаем 0 как дефолт для существующих NULL значений (на всякий случай)
UPDATE poll_responses SET selected_option = 0 WHERE selected_option IS NULL;

-- Добавляем новый check constraint, который разрешает NULL
-- Это позволит сохранять ответы без выбора опции (для пользовательских вариантов)
ALTER TABLE poll_responses ADD CONSTRAINT poll_responses_selected_option_check 
CHECK (selected_option IS NULL OR (selected_option >= 1 AND selected_option <= 10));
