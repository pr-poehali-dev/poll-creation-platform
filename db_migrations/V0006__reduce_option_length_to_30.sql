-- Уменьшение лимита символов для вариантов ответов до 30
-- Сначала обрезаем существующие данные

UPDATE polls SET option1 = LEFT(option1, 30) WHERE LENGTH(option1) > 30;
UPDATE polls SET option2 = LEFT(option2, 30) WHERE LENGTH(option2) > 30;
UPDATE polls SET option3 = LEFT(option3, 30) WHERE LENGTH(option3) > 30;
UPDATE polls SET option4 = LEFT(option4, 30) WHERE LENGTH(option4) > 30;
UPDATE polls SET option5 = LEFT(option5, 30) WHERE LENGTH(option5) > 30;
UPDATE polls SET option6 = LEFT(option6, 30) WHERE LENGTH(option6) > 30;
UPDATE polls SET option7 = LEFT(option7, 30) WHERE LENGTH(option7) > 30;
UPDATE polls SET option8 = LEFT(option8, 30) WHERE LENGTH(option8) > 30;
UPDATE polls SET option9 = LEFT(option9, 30) WHERE LENGTH(option9) > 30;
UPDATE polls SET option10 = LEFT(option10, 30) WHERE LENGTH(option10) > 30;

-- Теперь меняем типы колонок
ALTER TABLE polls 
    ALTER COLUMN option1 TYPE VARCHAR(30),
    ALTER COLUMN option2 TYPE VARCHAR(30),
    ALTER COLUMN option3 TYPE VARCHAR(30),
    ALTER COLUMN option4 TYPE VARCHAR(30),
    ALTER COLUMN option5 TYPE VARCHAR(30),
    ALTER COLUMN option6 TYPE VARCHAR(30),
    ALTER COLUMN option7 TYPE VARCHAR(30),
    ALTER COLUMN option8 TYPE VARCHAR(30),
    ALTER COLUMN option9 TYPE VARCHAR(30),
    ALTER COLUMN option10 TYPE VARCHAR(30);