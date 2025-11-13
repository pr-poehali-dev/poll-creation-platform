-- Создание таблицы для хранения пользовательских вариантов ответов посетителей

CREATE TABLE IF NOT EXISTS user_custom_options (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER REFERENCES polls(id),
    user_fingerprint VARCHAR(255) NOT NULL,
    option_text VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_fingerprint, option_text)
);

CREATE INDEX IF NOT EXISTS idx_user_custom_options_poll ON user_custom_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_options_user ON user_custom_options(user_fingerprint);