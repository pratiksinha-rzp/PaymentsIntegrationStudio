ALTER TABLE executions
ADD COLUMN credential_id UUID REFERENCES credentials(id);