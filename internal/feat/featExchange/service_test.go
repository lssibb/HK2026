package exchange_service_test

import (
	"context"
	"testing"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/exchange"
	exchange_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featExchange"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockExchangeRepository struct {
	mock.Mock
}

func (m *MockExchangeRepository) CreateExchange(ctx context.Context, exchange domain.PlantExchange) (domain.PlantExchange, error) {
	args := m.Called(ctx, exchange)
	return args.Get(0).(domain.PlantExchange), args.Error(1)
}
func (m *MockExchangeRepository) GetActiveExchanges(ctx context.Context) ([]domain.PlantExchange, error) {
	args := m.Called(ctx)
	return args.Get(0).([]domain.PlantExchange), args.Error(1)
}
func (m *MockExchangeRepository) CreateChat(ctx context.Context, chat domain.ExchangeChat) (domain.ExchangeChat, error) {
	args := m.Called(ctx, chat)
	return args.Get(0).(domain.ExchangeChat), args.Error(1)
}
func (m *MockExchangeRepository) GetChatsByUser(ctx context.Context, userID int64) ([]domain.ExchangeChat, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]domain.ExchangeChat), args.Error(1)
}
func (m *MockExchangeRepository) SendMessage(ctx context.Context, msg domain.ChatMessage) (domain.ChatMessage, error) {
	args := m.Called(ctx, msg)
	return args.Get(0).(domain.ChatMessage), args.Error(1)
}
func (m *MockExchangeRepository) GetMessages(ctx context.Context, chatID int64) ([]domain.ChatMessage, error) {
	args := m.Called(ctx, chatID)
	return args.Get(0).([]domain.ChatMessage), args.Error(1)
}
func (m *MockExchangeRepository) GetExchangeByID(ctx context.Context, id int64) (domain.PlantExchange, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(domain.PlantExchange), args.Error(1)
}
func (m *MockExchangeRepository) UpdateExchange(ctx context.Context, id int64, patch domain.PlantExchange) (domain.PlantExchange, error) {
	args := m.Called(ctx, id, patch)
	return args.Get(0).(domain.PlantExchange), args.Error(1)
}
func (m *MockExchangeRepository) RemoveExchange(ctx context.Context, id int64) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *MockExchangeRepository) GetMessagesByExchange(ctx context.Context, exchangeID int64) ([]domain.ChatMessage, error) {
	args := m.Called(ctx, exchangeID)
	return args.Get(0).([]domain.ChatMessage), args.Error(1)
}

func TestCreateExchange(t *testing.T) {
	mockRepo := new(MockExchangeRepository)
	service := exchange_service.NewExchangeService(mockRepo)
	ctx := context.Background()

	t.Run("success", func(t *testing.T) {
		ex := domain.PlantExchange{PlantName: "Aloe"}
		mockRepo.On("CreateExchange", ctx, mock.MatchedBy(func(e domain.PlantExchange) bool {
			return e.UserID == 1 && e.PlantName == "Aloe"
		})).Return(domain.PlantExchange{ID: 1}, nil)

		created, err := service.CreateExchange(ctx, 1, ex)
		assert.NoError(t, err)
		assert.Equal(t, int64(1), created.ID)
	})
}
