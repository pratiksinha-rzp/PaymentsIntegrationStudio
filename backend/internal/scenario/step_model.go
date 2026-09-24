package scenario

type ScenarioStep struct {
	ID             string                 `json:"id"`
	ScenarioID     string                 `json:"scenario_id"`
	StepOrder      int                    `json:"step_order"`
	Name           string                 `json:"name"`
	Method         string                 `json:"method"`
	URL            string                 `json:"url"`
	VariablePrefix string                 `json:"variable_prefix,omitempty"`
	Headers        map[string]interface{} `json:"headers"`
	QueryParams    map[string]interface{} `json:"query_params"`
	Body           map[string]interface{} `json:"body"`
}
