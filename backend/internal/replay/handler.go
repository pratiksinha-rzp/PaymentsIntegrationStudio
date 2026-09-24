package replay

import (
	"encoding/json"
	"net/http"
)

type ReplayRequest struct {
	ExecutionID     string `json:"execution_id"`
	ExecutionStepID string `json:"execution_step_id"`
	ScenarioStepID  string `json:"scenario_step_id"`
	CredentialID    string `json:"credential_id"`
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) ReplayStep(w http.ResponseWriter, r *http.Request) {
	var input ReplayRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if input.ExecutionID == "" ||
		input.ExecutionStepID == "" ||
		input.ScenarioStepID == "" ||
		input.CredentialID == "" {
		http.Error(
			w,
			"execution_id, execution_step_id, scenario_step_id and credential_id are required",
			http.StatusBadRequest,
		)
		return
	}

	step, err := h.service.scenarioRepository.GetStepByID(
		r.Context(),
		input.ScenarioStepID,
	)
	if err != nil {
		http.Error(w, "scenario step not found", http.StatusNotFound)
		return
	}

	variables := make(map[string]interface{})

	response, err := h.service.ReplayStep(
		r.Context(),
		input.ExecutionID,
		input.ExecutionStepID,
		step,
		input.CredentialID,
		variables,
	)
	if err != nil {
		http.Error(
			w,
			"failed to replay step: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	result := map[string]interface{}{
		"status_code": response.StatusCode,
		"headers":     response.Headers,
		"body":        json.RawMessage(response.Body),
		"latency_ms":  response.LatencyMs,
	}

	json.NewEncoder(w).Encode(result)
}

func (h *Handler) ReplayAPI(w http.ResponseWriter, r *http.Request) {
	var input APIReplayRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if input.Method == "" {
		http.Error(w, "method is required", http.StatusBadRequest)
		return
	}

	if input.URL == "" {
		http.Error(w, "url is required", http.StatusBadRequest)
		return
	}

	if input.CredentialID == "" {
		http.Error(w, "credential_id is required", http.StatusBadRequest)
		return
	}

	executionRecord, response, err := h.service.ReplayAPI(
		r.Context(),
		APIReplayRequest{
			Method:       input.Method,
			URL:          input.URL,
			Headers:      input.Headers,
			QueryParams:  input.QueryParams,
			Body:         input.Body,
			CredentialID: input.CredentialID,
		},
	)
	if err != nil {
		http.Error(
			w,
			"failed to replay API: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	result := map[string]interface{}{
		"execution_id": executionRecord.ID,
		"status":       executionRecord.Status,
		"status_code":  response.StatusCode,
		"headers":      response.Headers,
		"body":         json.RawMessage(response.Body),
		"latency_ms":   response.LatencyMs,
	}

	json.NewEncoder(w).Encode(result)
}
