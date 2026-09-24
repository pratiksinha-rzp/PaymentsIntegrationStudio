package credential

import (
	"encoding/json"
	"net/http"
	"strings"
)

type CreateCredentialRequest struct {
	Name        string `json:"name"`
	Environment string `json:"environment"`
	KeyID       string `json:"key_id"`
	KeySecret   string `json:"key_secret"`
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
	var input CreateCredentialRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(
			w,
			"invalid request body",
			http.StatusBadRequest,
		)
		return
	}

	credential := Credential{
		Name:        input.Name,
		Environment: input.Environment,
		KeyID:       input.KeyID,
		KeySecret:   input.KeySecret,
	}

	if err := h.service.Create(r.Context(), &credential); err != nil {
		http.Error(
			w,
			"failed to create credential",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(credential); err != nil {
		return
	}
}

func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	credentials, err := h.service.GetAll(r.Context())
	if err != nil {
		http.Error(
			w,
			"failed to fetch credentials",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(credentials); err != nil {
		return
	}
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/credentials/",
	)

	if id == "" {
		http.Error(
			w,
			"credential id is required",
			http.StatusBadRequest,
		)
		return
	}

	credential, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(
			w,
			"credential not found",
			http.StatusNotFound,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(credential); err != nil {
		return
	}
}
