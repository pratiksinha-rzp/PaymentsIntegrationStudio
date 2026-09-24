CREATE TABLE execution_steps (
    id UUID PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    scenario_step_id UUID NOT NULL REFERENCES scenario_steps(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    status_code INTEGER,
    request_headers JSONB,
    request_body JSONB,
    response_headers JSONB,
    response_body JSONB,
    error TEXT,
    latency_ms BIGINT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (execution_id, step_order)
);