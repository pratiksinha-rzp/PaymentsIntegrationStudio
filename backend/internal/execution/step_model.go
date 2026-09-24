package execution

import "time"

type ExecutionStep struct {
	ID                 string                 `json:"id"`
	ExecutionID        string                 `json:"execution_id"`
	ScenarioStepID     *string                `json:"scenario_step_id,omitempty"`
	ScenarioStepName   string                 `json:"scenario_step_name,omitempty"`
	StepOrder          int                    `json:"step_order"`
	Status             string                 `json:"status"`
	StatusCode         *int                   `json:"status_code,omitempty"`
	RequestMethod      string                 `json:"request_method,omitempty"`
	RequestURL         string                 `json:"request_url,omitempty"`
	RequestHeaders     map[string]interface{} `json:"request_headers,omitempty"`
	RequestQueryParams map[string]interface{} `json:"request_query_params,omitempty"`
	RequestBody        map[string]interface{} `json:"request_body,omitempty"`
	VariablesResolved  map[string]interface{} `json:"variables_resolved,omitempty"`
	ResponseHeaders    map[string]interface{} `json:"response_headers,omitempty"`
	ResponseBody       map[string]interface{} `json:"response_body,omitempty"`
	Error              string                 `json:"error,omitempty"`
	LatencyMs          *int64                 `json:"latency_ms,omitempty"`
	StartedAt          *time.Time             `json:"started_at,omitempty"`
	CompletedAt        *time.Time             `json:"completed_at,omitempty"`
}
