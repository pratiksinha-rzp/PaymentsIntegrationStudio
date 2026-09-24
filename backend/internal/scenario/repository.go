package scenario

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		DB: db,
	}
}

func (r *Repository) Create(ctx context.Context, scenario *Scenario) error {
	_, err := r.DB.Exec(ctx, `
		INSERT INTO scenarios (
			id,
			name,
			description,
			environment,
			status
		)
		VALUES ($1, $2, $3, $4, $5)
	`,
		scenario.ID,
		scenario.Name,
		scenario.Description,
		scenario.Environment,
		scenario.Status,
	)

	return err
}

func (r *Repository) GetAll(ctx context.Context) ([]Scenario, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT
			id,
			name,
			description,
			environment,
			status
		FROM scenarios
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scenarios []Scenario

	for rows.Next() {
		var scenario Scenario

		if err := rows.Scan(
			&scenario.ID,
			&scenario.Name,
			&scenario.Description,
			&scenario.Environment,
			&scenario.Status,
		); err != nil {
			return nil, err
		}

		scenarios = append(scenarios, scenario)
	}

	return scenarios, rows.Err()
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Scenario, error) {
	var scenario Scenario

	err := r.DB.QueryRow(ctx, `
		SELECT
			id,
			name,
			description,
			environment,
			status
		FROM scenarios
		WHERE id = $1
	`, id).Scan(
		&scenario.ID,
		&scenario.Name,
		&scenario.Description,
		&scenario.Environment,
		&scenario.Status,
	)

	if err != nil {
		return nil, err
	}

	return &scenario, nil
}

func (r *Repository) CreateStep(ctx context.Context, step *ScenarioStep) error {
	_, err := r.DB.Exec(ctx, `
		INSERT INTO scenario_steps (
			id,
			scenario_id,
			step_order,
			name,
			method,
			url,
			variable_prefix,
			headers,
			query_params,
			body
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`,
		step.ID,
		step.ScenarioID,
		step.StepOrder,
		step.Name,
		step.Method,
		step.URL,
		step.VariablePrefix,
		step.Headers,
		step.QueryParams,
		step.Body,
	)

	return err
}

func (r *Repository) GetSteps(ctx context.Context, scenarioID string) ([]ScenarioStep, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT
			id,
			scenario_id,
			step_order,
			name,
			method,
			url,
			variable_prefix,
			headers,
			query_params,
			body
		FROM scenario_steps
		WHERE scenario_id = $1
		ORDER BY step_order ASC
	`, scenarioID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var steps []ScenarioStep

	for rows.Next() {
		var step ScenarioStep

		if err := rows.Scan(
			&step.ID,
			&step.ScenarioID,
			&step.StepOrder,
			&step.Name,
			&step.Method,
			&step.URL,
			&step.VariablePrefix,
			&step.Headers,
			&step.QueryParams,
			&step.Body,
		); err != nil {
			return nil, err
		}

		steps = append(steps, step)
	}

	return steps, rows.Err()
}

func (r *Repository) GetStepByID(ctx context.Context, id string) (*ScenarioStep, error) {
	var step ScenarioStep

	err := r.DB.QueryRow(ctx, `
		SELECT
			id,
			scenario_id,
			step_order,
			name,
			method,
			url,
			variable_prefix,
			headers,
			query_params,
			body
		FROM scenario_steps
		WHERE id = $1
	`, id).Scan(
		&step.ID,
		&step.ScenarioID,
		&step.StepOrder,
		&step.Name,
		&step.Method,
		&step.URL,
		&step.VariablePrefix,
		&step.Headers,
		&step.QueryParams,
		&step.Body,
	)

	if err != nil {
		return nil, err
	}

	return &step, nil
}

func (r *Repository) Update(
	ctx context.Context,
	scenario *Scenario,
) error {
	_, err := r.DB.Exec(ctx, `
		UPDATE scenarios
		SET
			name = $1,
			description = $2,
			environment = $3,
			updated_at = NOW()
		WHERE id = $4
	`,
		scenario.Name,
		scenario.Description,
		scenario.Environment,
		scenario.ID,
	)

	return err
}

func (r *Repository) UpdateStep(
	ctx context.Context,
	step *ScenarioStep,
) error {
	_, err := r.DB.Exec(ctx, `
		UPDATE scenario_steps
		SET
			step_order = $1,
			name = $2,
			method = $3,
			url = $4,
			variable_prefix = $5,
			headers = $6,
			query_params = $7,
			body = $8,
			updated_at = NOW()
		WHERE id = $9
	`,
		step.StepOrder,
		step.Name,
		step.Method,
		step.URL,
		step.VariablePrefix,
		step.Headers,
		step.QueryParams,
		step.Body,
		step.ID,
	)

	return err
}