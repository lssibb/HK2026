package plants_service

import (
	"context"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/plant"
)

type PlantsService struct {
	repo PlantsRepository
}

func NewPlantsService(repo PlantsRepository) *PlantsService {
	return &PlantsService{repo: repo}
}

func (s *PlantsService) GetPlants(ctx context.Context, searchQuery string) ([]domain.Plant, error) {
	return s.repo.GetPlants(ctx, searchQuery)
}

func (s *PlantsService) GetPlantByID(ctx context.Context, id int64) (domain.Plant, error) {
	return s.repo.GetPlantByID(ctx, id)
}
