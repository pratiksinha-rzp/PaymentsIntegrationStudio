package scenario

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

type CreateScenarioRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Environment string `json:"environment"`
}

type UpdateScenarioRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Environment string `json:"environment"`
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var input CreateScenarioRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	scenario := Scenario{
		Name:        input.Name,
		Description: input.Description,
		Environment: input.Environment,
	}

	if err := h.service.Create(r.Context(), &scenario); err != nil {
		http.Error(w, "failed to create scenario", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(scenario); err != nil {
		return
	}
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	scenarios, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(w, "failed to fetch scenarios", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(scenarios); err != nil {
		return
	}
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/scenarios/")

	if id == "" {
		http.Error(w, "scenario id is required", http.StatusBadRequest)
		return
	}

	scenario, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "scenario not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(scenario); err != nil {
		return
	}
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/scenarios/")

	if id == "" {
		http.Error(w, "scenario id is required", http.StatusBadRequest)
		return
	}

	var input UpdateScenarioRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	scenario := Scenario{
		ID:          id,
		Name:        input.Name,
		Description: input.Description,
		Environment: input.Environment,
	}

	if err := h.service.Update(r.Context(), &scenario); err != nil {
		http.Error(w, "failed to update scenario", http.StatusInternalServerError)
		return
	}

	updatedScenario, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(
			w,
			"scenario updated but could not be fetched",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(updatedScenario); err != nil {
		return
	}
}

func (h *Handler) CreateStep(w http.ResponseWriter, r *http.Request) {
	var step ScenarioStep

	if err := json.NewDecoder(r.Body).Decode(&step); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	scenarioID := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/scenarios/",
	)

	scenarioID = strings.TrimSuffix(
		scenarioID,
		"/steps",
	)

	if scenarioID == "" {
		http.Error(w, "scenario id is required", http.StatusBadRequest)
		return
	}

	step.ScenarioID = scenarioID

	if err := h.service.CreateStep(r.Context(), &step); err != nil {
		log.Printf(
			"failed to create scenario step: %v",
			err,
		)

		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(step); err != nil {
		return
	}
}

func (h *Handler) UpdateStep(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/scenarios/",
	)

	parts := strings.Split(
		strings.Trim(path, "/"),
		"/",
	)

	if len(parts) != 3 ||
		parts[1] != "steps" ||
		parts[0] == "" ||
		parts[2] == "" {

		http.Error(
			w,
			"invalid scenario step path",
			http.StatusBadRequest,
		)
		return
	}

	scenarioID := parts[0]
	stepID := parts[2]

	var step ScenarioStep

	if err := json.NewDecoder(r.Body).Decode(&step); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	step.ID = stepID
	step.ScenarioID = scenarioID

	if err := h.service.UpdateStep(r.Context(), &step); err != nil {
		http.Error(
			w,
			"failed to update scenario step",
			http.StatusInternalServerError,
		)
		return
	}

	updatedStep, err := h.service.GetStepByID(
		r.Context(),
		stepID,
	)

	if err != nil {
		http.Error(
			w,
			"step updated but could not be fetched",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(updatedStep); err != nil {
		return
	}
}

func (h *Handler) GetSteps(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/scenarios/",
	)

	scenarioID := strings.TrimSuffix(
		path,
		"/steps",
	)

	if scenarioID == "" {
		http.Error(
			w,
			"scenario id is required",
			http.StatusBadRequest,
		)
		return
	}

	steps, err := h.service.GetSteps(
		r.Context(),
		scenarioID,
	)

	if err != nil {
		http.Error(
			w,
			"failed to fetch scenario steps",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(steps); err != nil {
		return
	}
}
