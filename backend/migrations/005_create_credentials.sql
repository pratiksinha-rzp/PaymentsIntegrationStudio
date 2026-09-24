CREATE TABLE credentials (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    environment VARCHAR(20) NOT NULL,
    key_id TEXT NOT NULL,
    key_secret TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);