package execution

import (
	"encoding/json"
	"net/http"
	"strings"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var input Execution

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.Create(r.Context(), &input); err != nil {
		http.Error(w, "failed to create execution", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(input)
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	executions, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "failed to fetch executions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(executions)
}

func (h *Handler) CreateStep(w http.ResponseWriter, r *http.Request) {
	var input ExecutionStep

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	path := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/executions/",
	)

	executionID := strings.TrimSuffix(path, "/steps")

	if executionID == "" {
		http.Error(w, "execution_id is required", http.StatusBadRequest)
		return
	}

	input.ExecutionID = executionID

	if err := h.service.CreateStep(r.Context(), &input); err != nil {
		http.Error(
			w,
			"failed to create execution step: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(input)
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/executions/",
	)

	execution, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "execution not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(execution)
}

func (h *Handler) GetSteps(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/executions/",
	)

	executionID := strings.TrimSuffix(path, "/steps")

	steps, err := h.service.GetSteps(r.Context(), executionID)
	if err != nil {
		http.Error(
			w,
			"failed to fetch execution steps: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(steps)
}
