CREATE TABLE scenario_steps (
    id UUID PRIMARY KEY,
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (scenario_id, step_order)
);