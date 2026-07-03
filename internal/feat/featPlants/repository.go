package plants_service

import (
	"context"
	"errors"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/plant"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PlantsRepository interface {
	GetPlants(ctx context.Context, searchQuery string) ([]domain.Plant, error)
	GetPlantByID(ctx context.Context, id int64) (domain.Plant, error)
}

type postgresPlantsRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresPlantsRepository(pool *pgxpool.Pool) PlantsRepository {
	return &postgresPlantsRepository{pool: pool}
}

func (r *postgresPlantsRepository) GetPlants(ctx context.Context, searchQuery string) ([]domain.Plant, error) {
	query := `
		SELECT id, name, watering_recommendations, lighting_recommendations, 
		       repotting_info, toxicity_info, additional_features, created_at, updated_at
		FROM plants
		WHERE name ILIKE $1
		ORDER BY name ASC
	`
	var plants []domain.Plant
	err := pgxscan.Select(ctx, r.pool, &plants, query, "%"+searchQuery+"%")
	return plants, err
}

func (r *postgresPlantsRepository) GetPlantByID(ctx context.Context, id int64) (domain.Plant, error) {
	query := `
		SELECT id, name, watering_recommendations, lighting_recommendations, 
		       repotting_info, toxicity_info, additional_features, created_at, updated_at
		FROM plants
		WHERE id = $1
	`
	var plant domain.Plant
	err := pgxscan.Get(ctx, r.pool, &plant, query, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Plant{}, errors.New("plant not found")
	}
	return plant, err
}
