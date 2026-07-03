package ai_service

import (
	"context"
	
	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/plant"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AIRepository interface {
	GetRecommendations(ctx context.Context, userID int64) ([]domain.Plant, error)
}

type postgresAIRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresAIRepository(pool *pgxpool.Pool) AIRepository {
	return &postgresAIRepository{pool: pool}
}

func (r *postgresAIRepository) GetRecommendations(ctx context.Context, userID int64) ([]domain.Plant, error) {
	query := `
		SELECT id, name, watering_recommendations, lighting_recommendations, 
		       repotting_info, toxicity_info, additional_features, created_at, updated_at
		FROM plants
		WHERE id NOT IN (SELECT plant_id FROM user_plants WHERE user_id = $1 AND plant_id IS NOT NULL)
		ORDER BY random()
		LIMIT 5
	`
	var plants []domain.Plant
	err := pgxscan.Select(ctx, r.pool, &plants, query, userID)
	return plants, err
}
