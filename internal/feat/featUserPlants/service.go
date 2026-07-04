package userplants_service

import (
	"context"
	"time"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user_plant"
)

type UserPlantsService struct {
	repo UserPlantsRepository
}

func NewUserPlantsService(repo UserPlantsRepository) *UserPlantsService {
	return &UserPlantsService{repo: repo}
}

func (s *UserPlantsService) AddUserPlant(ctx context.Context, userID int64, plant domain.UserPlant) (domain.UserPlant, error) {
	plant.UserID = userID
	
	// Calculate initial next_watering_date if interval is provided
	if plant.WateringIntervalDays != nil && *plant.WateringIntervalDays > 0 {
		nextDate := time.Now().AddDate(0, 0, *plant.WateringIntervalDays)
		plant.NextWateringDate = &nextDate
	}
	
	if plant.RepottingIntervalDays != nil && *plant.RepottingIntervalDays > 0 {
		nextDate := time.Now().AddDate(0, 0, *plant.RepottingIntervalDays)
		plant.NextRepottingDate = &nextDate
	}

	return s.repo.AddUserPlant(ctx, plant)
}

func (s *UserPlantsService) GetUserPlants(ctx context.Context, userID int64) ([]domain.UserPlant, error) {
	return s.repo.GetUserPlants(ctx, userID)
}

func (s *UserPlantsService) AddFavorite(ctx context.Context, userID, plantID int64) error {
	return s.repo.AddFavorite(ctx, userID, plantID)
}

func (s *UserPlantsService) GetFavorites(ctx context.Context, userID int64) ([]int64, error) {
	return s.repo.GetFavorites(ctx, userID)
}

func (s *UserPlantsService) GetReminders(ctx context.Context, userID int64) ([]domain.UserPlant, error) {
	return s.repo.GetReminders(ctx, userID)
}

func (s *UserPlantsService) GetUserPlantByID(ctx context.Context, userID, id int64) (domain.UserPlant, error) {
	return s.repo.GetUserPlantByID(ctx, userID, id)
}

func (s *UserPlantsService) UpdateUserPlant(ctx context.Context, userID, id int64, patch domain.UserPlant) (domain.UserPlant, error) {
	return s.repo.UpdateUserPlant(ctx, userID, id, patch)
}

func (s *UserPlantsService) RemoveUserPlant(ctx context.Context, userID, id int64) error {
	return s.repo.RemoveUserPlant(ctx, userID, id)
}

func (s *UserPlantsService) RemoveFavorite(ctx context.Context, userID, plantID int64) error {
	return s.repo.RemoveFavorite(ctx, userID, plantID)
}

func (s *UserPlantsService) MarkWatered(ctx context.Context, userID, id int64, at time.Time) (domain.UserPlant, error) {
	plant, err := s.repo.GetUserPlantByID(ctx, userID, id)
	if err != nil {
		return plant, err
	}
	if plant.WateringIntervalDays != nil && *plant.WateringIntervalDays > 0 {
		nextDate := at.AddDate(0, 0, *plant.WateringIntervalDays)
		plant.NextWateringDate = &nextDate
	}
	return s.repo.UpdateUserPlant(ctx, userID, id, plant)
}

func (s *UserPlantsService) MarkRepotted(ctx context.Context, userID, id int64, at time.Time) (domain.UserPlant, error) {
	plant, err := s.repo.GetUserPlantByID(ctx, userID, id)
	if err != nil {
		return plant, err
	}
	if plant.RepottingIntervalDays != nil && *plant.RepottingIntervalDays > 0 {
		nextDate := at.AddDate(0, 0, *plant.RepottingIntervalDays)
		plant.NextRepottingDate = &nextDate
	}
	return s.repo.UpdateUserPlant(ctx, userID, id, plant)
}

