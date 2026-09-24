ALTER TABLE execution_steps
ADD COLUMN variables_resolved JSONB NOT NULL DEFAULT '{}'::jsonb;