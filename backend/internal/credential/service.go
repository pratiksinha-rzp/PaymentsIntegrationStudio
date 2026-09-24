package credential

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

func (s *Service) Create(
	ctx context.Context,
	credential *Credential,
) error {
	credential.ID = uuid.New().String()

	return s.repo.Create(ctx, credential)
}

func (s *Service) GetAll(
	ctx context.Context,
) ([]Credential, error) {
	return s.repo.GetAll(ctx)
}

func (s *Service) GetByID(
	ctx context.Context,
	id string,
) (*Credential, error) {
	return s.repo.GetByID(ctx, id)
}
