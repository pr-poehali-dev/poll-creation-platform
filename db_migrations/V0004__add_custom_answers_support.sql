ALTER TABLE polls 
ADD COLUMN allow_custom_answers BOOLEAN DEFAULT false;

ALTER TABLE poll_responses
ADD COLUMN custom_answer VARCHAR(100);