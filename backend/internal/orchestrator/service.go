package orchestrator

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"payments-integration-studio/internal/execution"
	"payments-integration-studio/internal/replay"
	"payments-integration-studio/internal/scenario"
)

type Service struct {
	executionService *execution.Service
	scenarioService  *scenario.Service
	replayService    *replay.Service
}

func NewService(
	executionService *execution.Service,
	scenarioService *scenario.Service,
	replayService *replay.Service,
) *Service {
	return &Service{
		executionService: executionService,
		scenarioService:  scenarioService,
		replayService:    replayService,
	}
}

func (s *Service) Execute(
	ctx context.Context,
	executionID string,
	scenarioID string,
	credentialID string,
) error {
	steps, err := s.scenarioService.GetSteps(ctx, scenarioID)
	if err != nil {
		return err
	}

	executionStartedAt := time.Now()
	variables := make(map[string]interface{})

	for _, scenarioStep := range steps {
		executionStep := &execution.ExecutionStep{
			ExecutionID:       executionID,
			ScenarioStepID:    &scenarioStep.ID,
			StepOrder:         scenarioStep.StepOrder,
			Status:            "pending",
			VariablesResolved: map[string]interface{}{},
		}

		if err := s.executionService.CreateStep(ctx, executionStep); err != nil {
			s.executionService.UpdateStatus(
				ctx,
				executionID,
				"failed",
				executionStartedAt,
				time.Now(),
			)

			return err
		}

		response, err := s.replayService.ReplayStep(
			ctx,
			executionID,
			executionStep.ID,
			&scenarioStep,
			credentialID,
			variables,
		)

		if err != nil {
			s.executionService.UpdateStatus(
				ctx,
				executionID,
				"failed",
				executionStartedAt,
				time.Now(),
			)

			return err
		}

		if scenarioStep.VariablePrefix != "" {
			var responseData map[string]interface{}

			if err := json.Unmarshal(response.Body, &responseData); err != nil {
				s.executionService.UpdateStatus(
					ctx,
					executionID,
					"failed",
					executionStartedAt,
					time.Now(),
				)

				return fmt.Errorf(
					"failed to parse response for variable extraction: %w",
					err,
				)
			}

			for key, value := range responseData {
				variables[scenarioStep.VariablePrefix+"."+key] = value
			}
		}
	}

	return s.executionService.UpdateStatus(
		ctx,
		executionID,
		"success",
		executionStartedAt,
		time.Now(),
	)
}
