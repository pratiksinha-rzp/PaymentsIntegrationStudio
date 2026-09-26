package execution

import (
	"context"
	"time"

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

func (r *Repository) Create(ctx context.Context, execution *Execution) error {
	var credentialID interface{}

	if execution.CredentialID != "" {
		credentialID = execution.CredentialID
	}

	_, err := r.DB.Exec(ctx, `
		INSERT INTO executions (
			id,
			scenario_id,
			credential_id,
			status,
			trigger_type
		)
		VALUES ($1, $2, $3, $4, $5)
	`,
		execution.ID,
		execution.ScenarioID,
		credentialID,
		execution.Status,
		execution.TriggerType,
	)

	return err
}

func (r *Repository) CreateStep(ctx context.Context, step *ExecutionStep) error {
	_, err := r.DB.Exec(ctx, `
		INSERT INTO execution_steps (
			id,
			execution_id,
			scenario_step_id,
			step_order,
			status,
			status_code,
			request_method,
			request_url,
			request_headers,
			request_query_params,
			request_body,
			variables_resolved,
			response_headers,
			response_body,
			error,
			latency_ms,
			started_at,
			completed_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14, $15,
			$16, $17, $18
		)
	`,
		step.ID,
		step.ExecutionID,
		step.ScenarioStepID,
		step.StepOrder,
		step.Status,
		step.StatusCode,
		step.RequestMethod,
		step.RequestURL,
		step.RequestHeaders,
		step.RequestQueryParams,
		step.RequestBody,
		step.VariablesResolved,
		step.ResponseHeaders,
		step.ResponseBody,
		step.Error,
		step.LatencyMs,
		step.StartedAt,
		step.CompletedAt,
	)

	return err
}

func (r *Repository) GetAll(ctx context.Context) ([]Execution, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT
			e.id,
			e.scenario_id,
			s.name AS scenario_name,
			COALESCE(e.credential_id::text, '') AS credential_id,
			e.status,
			e.trigger_type,
			e.started_at,
			e.completed_at,
			CASE
				WHEN e.started_at IS NOT NULL
					AND e.completed_at IS NOT NULL
				THEN (EXTRACT(EPOCH FROM (e.completed_at - e.started_at)) * 1000)::bigint
				ELSE 0
			END AS duration_ms,
			(
				SELECT COUNT(*)
				FROM execution_steps es
				WHERE es.execution_id = e.id
			) AS step_count
		FROM executions e
		LEFT JOIN scenarios s ON s.id = e.scenario_id
		ORDER BY e.created_at DESC
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var executions []Execution

	for rows.Next() {
		var execution Execution

		if err := rows.Scan(
			&execution.ID,
			&execution.ScenarioID,
			&execution.ScenarioName,
			&execution.CredentialID,
			&execution.Status,
			&execution.TriggerType,
			&execution.StartedAt,
			&execution.CompletedAt,
			&execution.DurationMs,
			&execution.StepCount,
		); err != nil {
			return nil, err
		}

		executions = append(executions, execution)
	}

	return executions, rows.Err()
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Execution, error) {
	var execution Execution

	err := r.DB.QueryRow(ctx, `
		SELECT
			e.id,
			e.scenario_id,
			s.name AS scenario_name,
			COALESCE(e.credential_id::text, '') AS credential_id,
			e.status,
			e.trigger_type,
			e.started_at,
			e.completed_at,
			CASE
				WHEN e.started_at IS NOT NULL
					AND e.completed_at IS NOT NULL
				THEN (EXTRACT(EPOCH FROM (e.completed_at - e.started_at)) * 1000)::bigint
				ELSE 0
			END AS duration_ms,
			(
				SELECT COUNT(*)
				FROM execution_steps es
				WHERE es.execution_id = e.id
			) AS step_count
		FROM executions e
		LEFT JOIN scenarios s ON s.id = e.scenario_id
		WHERE e.id = $1
	`,
		id,
	).Scan(
		&execution.ID,
		&execution.ScenarioID,
		&execution.ScenarioName,
		&execution.CredentialID,
		&execution.Status,
		&execution.TriggerType,
		&execution.StartedAt,
		&execution.CompletedAt,
		&execution.DurationMs,
		&execution.StepCount,
	)

	if err != nil {
		return nil, err
	}

	return &execution, nil
}

func (r *Repository) GetSteps(ctx context.Context, executionID string) ([]ExecutionStep, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT
			es.id,
			es.execution_id,
			es.scenario_step_id,
			COALESCE(ss.name, '') AS scenario_step_name,
			es.step_order,
			es.status,
			es.status_code,
			COALESCE(es.request_method, '') AS request_method,
			es.request_url,
			es.request_headers,
			COALESCE(es.request_query_params, '{}'::jsonb) AS request_query_params,
			es.request_body,
			es.variables_resolved,
			es.response_headers,
			es.response_body,
			es.error,
			es.latency_ms,
			es.started_at,
			es.completed_at
		FROM execution_steps es
		LEFT JOIN scenario_steps ss ON ss.id = es.scenario_step_id
		WHERE es.execution_id = $1
		ORDER BY es.step_order ASC
	`,
		executionID,
	)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var steps []ExecutionStep

	for rows.Next() {
		var step ExecutionStep

		if err := rows.Scan(
			&step.ID,
			&step.ExecutionID,
			&step.ScenarioStepID,
			&step.ScenarioStepName,
			&step.StepOrder,
			&step.Status,
			&step.StatusCode,
			&step.RequestMethod,
			&step.RequestURL,
			&step.RequestHeaders,
			&step.RequestQueryParams,
			&step.RequestBody,
			&step.VariablesResolved,
			&step.ResponseHeaders,
			&step.ResponseBody,
			&step.Error,
			&step.LatencyMs,
			&step.StartedAt,
			&step.CompletedAt,
		); err != nil {
			return nil, err
		}

		steps = append(steps, step)
	}

	return steps, rows.Err()
}

func (r *Repository) UpdateStepResult(
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
	_, err := r.DB.Exec(ctx, `
		UPDATE execution_steps
		SET
			status = $1,
			status_code = $2,
			request_url = $3,
			request_headers = $4,
			request_body = $5,
			variables_resolved = $6,
			response_headers = $7,
			response_body = $8,
			error = $9,
			latency_ms = $10,
			started_at = $11,
			completed_at = $12
		WHERE id = $13
	`,
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
		executionStepID,
	)

	return err
}

func (r *Repository) UpdateStatus(
	ctx context.Context,
	executionID string,
	status string,
	startedAt time.Time,
	completedAt time.Time,
) error {
	_, err := r.DB.Exec(ctx, `
		UPDATE executions
		SET
			status = $1,
			started_at = $2,
			completed_at = $3
		WHERE id = $4
	`,
		status,
		startedAt,
		completedAt,
		executionID,
	)

	return err
}
