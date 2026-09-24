package credential

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

func (r *Repository) Create(
	ctx context.Context,
	credential *Credential,
) error {
	_, err := r.DB.Exec(ctx, `
		INSERT INTO credentials (
			id,
			name,
			environment,
			key_id,
			key_secret
		)
		VALUES ($1, $2, $3, $4, $5)
	`,
		credential.ID,
		credential.Name,
		credential.Environment,
		credential.KeyID,
		credential.KeySecret,
	)

	return err
}

func (r *Repository) GetAll(
	ctx context.Context,
) ([]Credential, error) {
	rows, err := r.DB.Query(ctx, `
		SELECT
			id,
			name,
			environment,
			key_id
		FROM credentials
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var credentials []Credential

	for rows.Next() {
		var credential Credential

		if err := rows.Scan(
			&credential.ID,
			&credential.Name,
			&credential.Environment,
			&credential.KeyID,
		); err != nil {
			return nil, err
		}

		credentials = append(credentials, credential)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return credentials, nil
}

func (r *Repository) GetByID(
	ctx context.Context,
	id string,
) (*Credential, error) {
	var credential Credential

	err := r.DB.QueryRow(ctx, `
		SELECT
			id,
			name,
			environment,
			key_id,
			key_secret
		FROM credentials
		WHERE id = $1
	`,
		id,
	).Scan(
		&credential.ID,
		&credential.Name,
		&credential.Environment,
		&credential.KeyID,
		&credential.KeySecret,
	)

	if err != nil {
		return nil, err
	}

	return &credential, nil
}
