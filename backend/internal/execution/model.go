package execution

import "time"

type Execution struct {
	ID           string     `json:"id"`
	ScenarioID   *string    `json:"scenario_id,omitempty"`
	ScenarioName *string    `json:"scenario_name,omitempty"`
	CredentialID string     `json:"credential_id"`
	Status       string     `json:"status"`
	TriggerType  string     `json:"trigger_type"`
	StartedAt    *time.Time `json:"started_at,omitempty"`
	CompletedAt  *time.Time `json:"completed_at,omitempty"`
	DurationMs   int64      `json:"duration_ms,omitempty"`
	StepCount    int        `json:"step_count,omitempty"`
}
