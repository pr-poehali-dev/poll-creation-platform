CREATE TABLE IF NOT EXISTS t_p73247595_poll_creation_platfo.visitor_stats (
  id SERIAL PRIMARY KEY,
  user_fingerprint VARCHAR(255) UNIQUE NOT NULL,
  first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visit_count INTEGER DEFAULT 1
);

CREATE INDEX idx_visitor_fingerprint ON t_p73247595_poll_creation_platfo.visitor_stats(user_fingerprint);