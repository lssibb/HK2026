package exchange_service

import (
	"context"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/exchange"
)

type ExchangeService struct {
	repo ExchangeRepository
}

func NewExchangeService(repo ExchangeRepository) *ExchangeService {
	return &ExchangeService{repo: repo}
}

func (s *ExchangeService) CreateExchange(ctx context.Context, userID int64, ex domain.PlantExchange) (domain.PlantExchange, error) {
	ex.UserID = userID
	return s.repo.CreateExchange(ctx, ex)
}

func (s *ExchangeService) GetActiveExchanges(ctx context.Context) ([]domain.PlantExchange, error) {
	return s.repo.GetActiveExchanges(ctx)
}

func (s *ExchangeService) CreateChat(ctx context.Context, userID int64, exchangeID int64) (domain.ExchangeChat, error) {
	chat := domain.ExchangeChat{
		ExchangeID:  exchangeID,
		InitiatorID: userID,
	}
	return s.repo.CreateChat(ctx, chat)
}

func (s *ExchangeService) GetChatsByUser(ctx context.Context, userID int64) ([]domain.ExchangeChat, error) {
	return s.repo.GetChatsByUser(ctx, userID)
}

func (s *ExchangeService) SendMessage(ctx context.Context, userID int64, chatID int64, text string) (domain.ChatMessage, error) {
	msg := domain.ChatMessage{
		ChatID:   chatID,
		SenderID: userID,
		Message:  text,
	}
	return s.repo.SendMessage(ctx, msg)
}

func (s *ExchangeService) GetMessages(ctx context.Context, chatID int64) ([]domain.ChatMessage, error) {
	return s.repo.GetMessages(ctx, chatID)
}
