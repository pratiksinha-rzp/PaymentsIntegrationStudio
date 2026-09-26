package replay

import (
	"encoding/json"
	"net/http"
)

func (h *Handler) ReplayWebhook(w http.ResponseWriter, r *http.Request) {
	var input WebhookReplayRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(
			w,
			"invalid request body",
			http.StatusBadRequest,
		)
		return
	}

	if input.URL == "" {
		http.Error(
			w,
			"url is required",
			http.StatusBadRequest,
		)
		return
	}

	if input.Method == "" {
		input.Method = http.MethodPost
	}

	executionRecord, response, err := h.service.ReplayWebhook(
		r.Context(),
		input,
	)
	if err != nil {
		http.Error(
			w,
			"failed to replay webhook: "+err.Error(),
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
