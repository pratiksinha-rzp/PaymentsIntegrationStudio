package replay

import (
	"context"
	"fmt"
	"time"

	"payments-integration-studio/internal/credential"
	"payments-integration-studio/internal/execution"
	"payments-integration-studio/internal/scenario"
	"payments-integration-studio/pkg/httpclient"
	"payments-integration-studio/pkg/interpolation"
)

type Service struct {
	httpClient           *httpclient.Client
	scenarioRepository   *scenario.Repository
	credentialRepository *credential.Repository
	executionService     *execution.Service
}

func NewService(
	httpClient *httpclient.Client,
	scenarioRepository *scenario.Repository,
	credentialRepository *credential.Repository,
	executionService *execution.Service,
) *Service {
	return &Service{
		httpClient:           httpClient,
		scenarioRepository:   scenarioRepository,
		credentialRepository: credentialRepository,
		executionService:     executionService,
	}
}

func (s *Service) ReplayStep(
	ctx context.Context,
	executionID string,
	executionStepID string,
	step *scenario.ScenarioStep,
	credentialID string,
	variables map[string]interface{},
) (*httpclient.Response, error) {
	credential, err := s.credentialRepository.GetByID(
		ctx,
		credentialID,
	)
	if err != nil {
		return nil, err
	}

	resolvedURL, err := interpolation.ResolveString(
		step.URL,
		variables,
	)
	if err != nil {
		return nil, err
	}

	resolvedHeaders, err := interpolation.ResolveMap(
		step.Headers,
		variables,
	)
	if err != nil {
		return nil, err
	}

	resolvedQueryParams, err := interpolation.ResolveMap(
		step.QueryParams,
		variables,
	)
	if err != nil {
		return nil, err
	}

	resolvedBody, err := interpolation.ResolveMap(
		step.Body,
		variables,
	)
	if err != nil {
		return nil, err
	}

	request := httpclient.Request{
		Method:      step.Method,
		URL:         resolvedURL,
		Headers:     resolvedHeaders,
		QueryParams: resolvedQueryParams,
		Body:        resolvedBody,
	}

	startedAt := time.Now()

	response, err := s.httpClient.Do(
		ctx,
		request,
		credential.KeyID,
		credential.KeySecret,
	)

	completedAt := time.Now()

	var status string
	var statusCode *int
	var responseHeaders map[string]string
	var responseBody []byte
	var latencyMs int64
	var errorMessage string

	if err != nil {
		status = "failed"
		errorMessage = err.Error()
	} else {
		statusCodeValue := response.StatusCode
		statusCode = &statusCodeValue

		responseHeaders = response.Headers
		responseBody = response.Body
		latencyMs = response.LatencyMs

		if response.StatusCode >= 200 && response.StatusCode < 300 {
			status = "success"
		} else {
			status = "failed"
			errorMessage = fmt.Sprintf(
				"request failed with status code %d",
				response.StatusCode,
			)
		}
	}

	updateErr := s.executionService.UpdateStepResult(
		ctx,
		executionStepID,
		status,
		statusCode,
		resolvedURL,
		resolvedHeaders,
		resolvedBody,
		variables,
		responseHeaders,
		responseBody,
		errorMessage,
		latencyMs,
		startedAt,
		completedAt,
	)

	if updateErr != nil {
		return nil, updateErr
	}

	if err != nil {
		return nil, err
	}

	return response, nil
}

type APIReplayRequest struct {
	Method       string                 `json:"method"`
	URL          string                 `json:"url"`
	Headers      map[string]interface{} `json:"headers"`
	QueryParams  map[string]interface{} `json:"query_params"`
	Body         map[string]interface{} `json:"body"`
	CredentialID string                 `json:"credential_id"`
}

func (s *Service) ReplayAPI(
	ctx context.Context,
	input APIReplayRequest,
) (*execution.Execution, *httpclient.Response, error) {
	credential, err := s.credentialRepository.GetByID(
		ctx,
		input.CredentialID,
	)
	if err != nil {
		return nil, nil, err
	}

	triggerType := "api_replay"
	status := "pending"

	executionRecord := &execution.Execution{
		ScenarioID:   nil,
		CredentialID: input.CredentialID,
		Status:       status,
		TriggerType:  triggerType,
	}

	if err := s.executionService.Create(ctx, executionRecord); err != nil {
		return nil, nil, err
	}

	executionStep := &execution.ExecutionStep{
		ExecutionID:        executionRecord.ID,
		ScenarioStepID:     nil,
		StepOrder:          1,
		Status:             "pending",
		RequestMethod:      input.Method,
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
		Method:      input.Method,
		URL:         input.URL,
		Headers:     input.Headers,
		QueryParams: input.QueryParams,
		Body:        input.Body,
	}

	startedAt := time.Now()

	response, err := s.httpClient.Do(
		ctx,
		request,
		credential.KeyID,
		credential.KeySecret,
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
		executionStatus = "success"

		statusCodeValue := response.StatusCode
		statusCode = &statusCodeValue

		responseHeaders = response.Headers
		responseBody = response.Body
		latencyMs = response.LatencyMs

		if response.StatusCode < 200 || response.StatusCode >= 300 {
			executionStatus = "failed"
			errorMessage = fmt.Sprintf(
				"request failed with status code %d",
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
