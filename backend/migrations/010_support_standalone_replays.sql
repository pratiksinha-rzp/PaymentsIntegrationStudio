-- Allow executions that are not tied to a scenario.
ALTER TABLE executions
ALTER COLUMN scenario_id DROP NOT NULL;

-- Allow execution steps that are not tied to a scenario step.
ALTER TABLE execution_steps
ALTER COLUMN scenario_step_id DROP NOT NULL;