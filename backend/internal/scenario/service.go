package scenario

import (
	"context"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) Create(ctx context.Context, scenario *Scenario) error {
	scenario.ID = uuid.New().String()
	scenario.Status = "active"

	return s.repo.Create(ctx, scenario)
}

func (s *Service) GetAll(ctx context.Context) ([]Scenario, error) {
	return s.repo.GetAll(ctx)
}

func (s *Service) GetByID(
	ctx context.Context,
	id string,
) (*Scenario, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Update(
	ctx context.Context,
	scenario *Scenario,
) error {
	return s.repo.Update(ctx, scenario)
}

func (s *Service) CreateStep(
	ctx context.Context,
	step *ScenarioStep,
) error {
	step.ID = uuid.New().String()

	return s.repo.CreateStep(ctx, step)
}

func (s *Service) GetSteps(
	ctx context.Context,
	scenarioID string,
) ([]ScenarioStep, error) {
	return s.repo.GetSteps(ctx, scenarioID)
}

func (s *Service) GetStepByID(
	ctx context.Context,
	id string,
) (*ScenarioStep, error) {
	return s.repo.GetStepByID(ctx, id)
}

func (s *Service) UpdateStep(
	ctx context.Context,
	step *ScenarioStep,
) error {
	return s.repo.UpdateStep(ctx, step)
}

func (s *Service) Clone(
	ctx context.Context,
	id string,
) (*Scenario, error) {
	sourceScenario, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	sourceSteps, err := s.repo.GetSteps(ctx, id)
	if err != nil {
		return nil, err
	}

	clonedScenario := &Scenario{
		Name:        "Copy of " + sourceScenario.Name,
		Description: sourceScenario.Description,
		Environment: sourceScenario.Environment,
	}

	if err := s.Create(ctx, clonedScenario); err != nil {
		return nil, err
	}

	for _, sourceStep := range sourceSteps {
		clonedStep := &ScenarioStep{
			ScenarioID:     clonedScenario.ID,
			StepOrder:      sourceStep.StepOrder,
			Name:           sourceStep.Name,
			Method:         sourceStep.Method,
			URL:            sourceStep.URL,
			VariablePrefix: sourceStep.VariablePrefix,
			Headers:        sourceStep.Headers,
			QueryParams:    sourceStep.QueryParams,
			Body:           sourceStep.Body,
		}

		if err := s.CreateStep(ctx, clonedStep); err != nil {
			return nil, err
		}
	}

	return clonedScenario, nil
}
