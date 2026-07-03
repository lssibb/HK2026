package userplants_service

import (
	"context"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user_plant"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserPlantsRepository interface {
	AddUserPlant(ctx context.Context, plant domain.UserPlant) (domain.UserPlant, error)
	GetUserPlants(ctx context.Context, userID int64) ([]domain.UserPlant, error)
	AddFavorite(ctx context.Context, userID, plantID int64) error
	GetFavorites(ctx context.Context, userID int64) ([]int64, error)
	GetReminders(ctx context.Context, userID int64) ([]domain.UserPlant, error)
}

type postgresUserPlantsRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresUserPlantsRepository(pool *pgxpool.Pool) UserPlantsRepository {
	return &postgresUserPlantsRepository{pool: pool}
}

func (r *postgresUserPlantsRepository) AddUserPlant(ctx context.Context, plant domain.UserPlant) (domain.UserPlant, error) {
	query := `
		INSERT INTO user_plants (user_id, plant_id, custom_name, notes, watering_interval_days, repotting_interval_days, next_watering_date, next_repotting_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, user_id, plant_id, custom_name, notes, watering_interval_days, repotting_interval_days, next_watering_date, next_repotting_date, added_date, updated_at
	`
	err := pgxscan.Get(ctx, r.pool, &plant, query, plant.UserID, plant.PlantID, plant.CustomName, plant.Notes, plant.WateringIntervalDays, plant.RepottingIntervalDays, plant.NextWateringDate, plant.NextRepottingDate)
	return plant, err
}

func (r *postgresUserPlantsRepository) GetUserPlants(ctx context.Context, userID int64) ([]domain.UserPlant, error) {
	query := `SELECT * FROM user_plants WHERE user_id = $1 ORDER BY added_date DESC`
	var plants []domain.UserPlant
	err := pgxscan.Select(ctx, r.pool, &plants, query, userID)
	return plants, err
}

func (r *postgresUserPlantsRepository) AddFavorite(ctx context.Context, userID, plantID int64) error {
	query := `INSERT INTO favorite_plants (user_id, plant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.pool.Exec(ctx, query, userID, plantID)
	return err
}

func (r *postgresUserPlantsRepository) GetFavorites(ctx context.Context, userID int64) ([]int64, error) {
	query := `SELECT plant_id FROM favorite_plants WHERE user_id = $1`
	var plantIDs []int64
	err := pgxscan.Select(ctx, r.pool, &plantIDs, query, userID)
	return plantIDs, err
}

func (r *postgresUserPlantsRepository) GetReminders(ctx context.Context, userID int64) ([]domain.UserPlant, error) {
	query := `
		SELECT * FROM user_plants 
		WHERE user_id = $1 
		AND (next_watering_date <= CURRENT_DATE OR next_repotting_date <= CURRENT_DATE)
		ORDER BY next_watering_date ASC
	`
	var plants []domain.UserPlant
	err := pgxscan.Select(ctx, r.pool, &plants, query, userID)
	return plants, err
}
