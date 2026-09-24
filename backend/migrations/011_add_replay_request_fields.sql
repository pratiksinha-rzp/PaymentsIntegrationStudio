ALTER TABLE execution_steps
ADD COLUMN request_method VARCHAR(10);

ALTER TABLE execution_steps
ADD COLUMN request_query_params JSONB NOT NULL DEFAULT '{}'::jsonb;