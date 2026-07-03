package plants_service_test

import (
	"context"
	"testing"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/plant"
	plants_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featPlants"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockPlantsRepository struct {
	mock.Mock
}

func (m *MockPlantsRepository) GetPlants(ctx context.Context, searchQuery string) ([]domain.Plant, error) {
	args := m.Called(ctx, searchQuery)
	return args.Get(0).([]domain.Plant), args.Error(1)
}

func (m *MockPlantsRepository) GetPlantByID(ctx context.Context, id int64) (domain.Plant, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(domain.Plant), args.Error(1)
}

func TestGetPlants(t *testing.T) {
	mockRepo := new(MockPlantsRepository)
	service := plants_service.NewPlantsService(mockRepo)

	ctx := context.Background()
	mockPlants := []domain.Plant{{ID: 1, Name: "Ficus"}}

	mockRepo.On("GetPlants", ctx, "Fic").Return(mockPlants, nil)

	result, err := service.GetPlants(ctx, "Fic")
	assert.NoError(t, err)
	assert.Len(t, result, 1)
	assert.Equal(t, "Ficus", result[0].Name)
}

func TestGetPlantByID(t *testing.T) {
	mockRepo := new(MockPlantsRepository)
	service := plants_service.NewPlantsService(mockRepo)

	ctx := context.Background()
	mockPlant := domain.Plant{ID: 1, Name: "Ficus"}

	mockRepo.On("GetPlantByID", ctx, int64(1)).Return(mockPlant, nil)

	result, err := service.GetPlantByID(ctx, 1)
	assert.NoError(t, err)
	assert.Equal(t, int64(1), result.ID)
}
