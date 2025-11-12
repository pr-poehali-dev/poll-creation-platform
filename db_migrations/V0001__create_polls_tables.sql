-- Создание таблиц для системы опросов

-- Таблица опросов
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    target_audience VARCHAR(30) NOT NULL,
    question VARCHAR(50) NOT NULL,
    option1 VARCHAR(50) NOT NULL,
    option2 VARCHAR(50) NOT NULL,
    option3 VARCHAR(50) NOT NULL,
    option4 VARCHAR(50) NOT NULL,
    option5 VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Таблица ответов
CREATE TABLE IF NOT EXISTS poll_responses (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id),
    user_fingerprint VARCHAR(255) NOT NULL,
    selected_option INTEGER NOT NULL CHECK (selected_option BETWEEN 1 AND 5),
    comment VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_fingerprint)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_poll_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_fingerprint ON poll_responses(user_fingerprint);

-- Вставка тестового опроса
INSERT INTO polls (target_audience, question, option1, option2, option3, option4, option5) 
VALUES 
    ('Всем гражданам', 'Поддерживаете ли вы переход на 4-дневку?', 'Полностью за', 'Скорее за', 'Нейтрально', 'Скорее против', 'Категорически против');