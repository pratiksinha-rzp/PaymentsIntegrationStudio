package orchestrator

import (
	"encoding/json"
	"net/http"
	"strings"
)

type RunRequest struct {
	ScenarioID   string `json:"scenario_id"`
	CredentialID string `json:"credential_id"`
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Run(w http.ResponseWriter, r *http.Request) {
	executionID := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/executions/",
	)

	executionID = strings.TrimSuffix(executionID, "/run")

	if executionID == "" {
		http.Error(w, "execution_id is required", http.StatusBadRequest)
		return
	}

	var input RunRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if input.ScenarioID == "" || input.CredentialID == "" {
		http.Error(
			w,
			"scenario_id and credential_id are required",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.service.Execute(
		r.Context(),
		executionID,
		input.ScenarioID,
		input.CredentialID,
	); err != nil {
		http.Error(
			w,
			"failed to execute scenario: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]interface{}{
		"execution_id": executionID,
		"status":       "success",
	})
}
