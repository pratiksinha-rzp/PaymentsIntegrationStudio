package replay

import (
	"context"
	"fmt"
	"time"

	"payments-integration-studio/internal/execution"
	"payments-integration-studio/pkg/httpclient"
)

type WebhookReplayRequest struct {
	URL         string                 `json:"url"`
	Method      string                 `json:"method"`
	Headers     map[string]interface{} `json:"headers"`
	QueryParams map[string]interface{} `json:"query_params"`
	Body        map[string]interface{} `json:"body"`
}

func (s *Service) ReplayWebhook(
	ctx context.Context,
	input WebhookReplayRequest,
) (*execution.Execution, *httpclient.Response, error) {
	method := input.Method

	if method == "" {
		method = "POST"
	}

	executionRecord := &execution.Execution{
		ScenarioID:   nil,
		CredentialID: "",
		Status:       "pending",
		TriggerType:  "webhook_replay",
	}

	if err := s.executionService.Create(ctx, executionRecord); err != nil {
		return nil, nil, err
	}

	executionStep := &execution.ExecutionStep{
		ExecutionID:        executionRecord.ID,
		ScenarioStepID:     nil,
		StepOrder:          1,
		Status:             "pending",
		RequestMethod:      method,
		RequestURL:         input.URL,
		RequestHeaders:     input.Headers,
		RequestQueryParams: input.QueryParams,
		RequestBody:        input.Body,
		VariablesResolved:  map[string]interface{}{},
	}

	if err := s.executionService.CreateStep(ctx, executionStep); err != nil {
		now := time.Now()

		_ = s.executionService.UpdateStatus(
			ctx,
			executionRecord.ID,
			"failed",
			now,
			now,
		)

		return nil, nil, err
	}

	request := httpclient.Request{
		Method:      method,
		URL:         input.URL,
		Headers:     input.Headers,
		QueryParams: input.QueryParams,
		Body:        input.Body,
	}

	startedAt := time.Now()

	response, err := s.httpClient.DoWithoutAuth(
		ctx,
		request,
	)

	completedAt := time.Now()

	var executionStatus string
	var statusCode *int
	var responseHeaders map[string]string
	var responseBody []byte
	var latencyMs int64
	var errorMessage string

	if err != nil {
		executionStatus = "failed"
		errorMessage = err.Error()
	} else {
		statusCodeValue := response.StatusCode
		statusCode = &statusCodeValue
		responseHeaders = response.Headers
		responseBody = response.Body
		latencyMs = response.LatencyMs

		executionStatus = "success"

		if response.StatusCode < 200 || response.StatusCode >= 300 {
			executionStatus = "failed"
			errorMessage = fmt.Sprintf(
				"webhook endpoint returned status code %d",
				response.StatusCode,
			)
		}
	}

	if err := s.executionService.UpdateStepResult(
		ctx,
		executionStep.ID,
		executionStatus,
		statusCode,
		input.URL,
		input.Headers,
		input.Body,
		map[string]interface{}{},
		responseHeaders,
		responseBody,
		errorMessage,
		latencyMs,
		startedAt,
		completedAt,
	); err != nil {
		return nil, nil, err
	}

	if err := s.executionService.UpdateStatus(
		ctx,
		executionRecord.ID,
		executionStatus,
		startedAt,
		completedAt,
	); err != nil {
		return nil, nil, err
	}

	executionRecord.Status = executionStatus

	if err != nil {
		return executionRecord, nil, err
	}

	return executionRecord, response, nil
}
