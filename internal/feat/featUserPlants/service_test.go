package userplants_service_test

import (
	"context"
	"testing"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user_plant"
	userplants_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featUserPlants"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockUserPlantsRepository struct {
	mock.Mock
}

func (m *MockUserPlantsRepository) AddUserPlant(ctx context.Context, plant domain.UserPlant) (domain.UserPlant, error) {
	args := m.Called(ctx, plant)
	return args.Get(0).(domain.UserPlant), args.Error(1)
}

func (m *MockUserPlantsRepository) GetUserPlants(ctx context.Context, userID int64) ([]domain.UserPlant, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]domain.UserPlant), args.Error(1)
}

func (m *MockUserPlantsRepository) AddFavorite(ctx context.Context, userID, plantID int64) error {
	args := m.Called(ctx, userID, plantID)
	return args.Error(0)
}

func (m *MockUserPlantsRepository) GetFavorites(ctx context.Context, userID int64) ([]int64, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]int64), args.Error(1)
}

func (m *MockUserPlantsRepository) GetReminders(ctx context.Context, userID int64) ([]domain.UserPlant, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]domain.UserPlant), args.Error(1)
}

func TestAddUserPlant(t *testing.T) {
	mockRepo := new(MockUserPlantsRepository)
	service := userplants_service.NewUserPlantsService(mockRepo)
	ctx := context.Background()

	t.Run("calculates dates", func(t *testing.T) {
		interval := 5
		plant := domain.UserPlant{
			PlantID:              func(i int64) *int64 { return &i }(1),
			WateringIntervalDays: &interval,
		}

		mockRepo.On("AddUserPlant", ctx, mock.MatchedBy(func(p domain.UserPlant) bool {
			return p.UserID == 1 && p.NextWateringDate != nil
		})).Return(domain.UserPlant{ID: 1}, nil)

		created, err := service.AddUserPlant(ctx, 1, plant)
		assert.NoError(t, err)
		assert.Equal(t, int64(1), created.ID)
	})
}
