package execution

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(ctx context.Context, execution *Execution) error {
	execution.ID = uuid.New().String()
	execution.Status = "pending"

	return s.repo.Create(ctx, execution)
}

func (s *Service) CreateStep(ctx context.Context, step *ExecutionStep) error {
	step.ID = uuid.New().String()
	step.Status = "pending"

	return s.repo.CreateStep(ctx, step)
}

func (s *Service) GetAll(ctx context.Context) ([]Execution, error) {
	return s.repo.GetAll(ctx)
}

func (s *Service) GetByID(ctx context.Context, id string) (*Execution, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) GetSteps(ctx context.Context, executionID string) ([]ExecutionStep, error) {
	return s.repo.GetSteps(ctx, executionID)
}

func (s *Service) UpdateStepResult(
	ctx context.Context,
	executionStepID string,
	status string,
	statusCode *int,
	requestURL string,
	requestHeaders map[string]interface{},
	requestBody map[string]interface{},
	variablesResolved map[string]interface{},
	responseHeaders map[string]string,
	responseBody []byte,
	errMessage string,
	latencyMs int64,
	startedAt time.Time,
	completedAt time.Time,
) error {
	return s.repo.UpdateStepResult(
		ctx,
		executionStepID,
		status,
		statusCode,
		requestURL,
		requestHeaders,
		requestBody,
		variablesResolved,
		responseHeaders,
		responseBody,
		errMessage,
		latencyMs,
		startedAt,
		completedAt,
	)
}

func (s *Service) UpdateStatus(
	ctx context.Context,
	executionID string,
	status string,
	startedAt time.Time,
	completedAt time.Time,
) error {
	return s.repo.UpdateStatus(
		ctx,
		executionID,
		status,
		startedAt,
		completedAt,
	)
}
