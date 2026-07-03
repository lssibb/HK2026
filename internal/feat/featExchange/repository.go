package exchange_service

import (
	"context"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/exchange"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ExchangeRepository interface {
	CreateExchange(ctx context.Context, exchange domain.PlantExchange) (domain.PlantExchange, error)
	GetActiveExchanges(ctx context.Context) ([]domain.PlantExchange, error)
	CreateChat(ctx context.Context, chat domain.ExchangeChat) (domain.ExchangeChat, error)
	GetChatsByUser(ctx context.Context, userID int64) ([]domain.ExchangeChat, error)
	SendMessage(ctx context.Context, msg domain.ChatMessage) (domain.ChatMessage, error)
	GetMessages(ctx context.Context, chatID int64) ([]domain.ChatMessage, error)
}

type postgresExchangeRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresExchangeRepository(pool *pgxpool.Pool) ExchangeRepository {
	return &postgresExchangeRepository{pool: pool}
}

func (r *postgresExchangeRepository) CreateExchange(ctx context.Context, ex domain.PlantExchange) (domain.PlantExchange, error) {
	query := `
		INSERT INTO plant_exchanges (user_id, plant_name, plant_id, description, exchange_preferences)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, plant_name, plant_id, description, exchange_preferences, status, created_at, updated_at
	`
	err := pgxscan.Get(ctx, r.pool, &ex, query, ex.UserID, ex.PlantName, ex.PlantID, ex.Description, ex.ExchangePreferences)
	return ex, err
}

func (r *postgresExchangeRepository) GetActiveExchanges(ctx context.Context) ([]domain.PlantExchange, error) {
	query := `SELECT * FROM plant_exchanges WHERE status = 'active' ORDER BY created_at DESC`
	var exchanges []domain.PlantExchange
	err := pgxscan.Select(ctx, r.pool, &exchanges, query)
	return exchanges, err
}

func (r *postgresExchangeRepository) CreateChat(ctx context.Context, chat domain.ExchangeChat) (domain.ExchangeChat, error) {
	query := `
		INSERT INTO exchange_chats (exchange_id, initiator_id)
		VALUES ($1, $2)
		RETURNING id, exchange_id, initiator_id, created_at
	`
	err := pgxscan.Get(ctx, r.pool, &chat, query, chat.ExchangeID, chat.InitiatorID)
	return chat, err
}

func (r *postgresExchangeRepository) GetChatsByUser(ctx context.Context, userID int64) ([]domain.ExchangeChat, error) {
	query := `
		SELECT c.* FROM exchange_chats c
		JOIN plant_exchanges e ON c.exchange_id = e.id
		WHERE c.initiator_id = $1 OR e.user_id = $1
		ORDER BY c.created_at DESC
	`
	var chats []domain.ExchangeChat
	err := pgxscan.Select(ctx, r.pool, &chats, query, userID)
	return chats, err
}

func (r *postgresExchangeRepository) SendMessage(ctx context.Context, msg domain.ChatMessage) (domain.ChatMessage, error) {
	query := `
		INSERT INTO chat_messages (chat_id, sender_id, message)
		VALUES ($1, $2, $3)
		RETURNING id, chat_id, sender_id, message, created_at
	`
	err := pgxscan.Get(ctx, r.pool, &msg, query, msg.ChatID, msg.SenderID, msg.Message)
	return msg, err
}

func (r *postgresExchangeRepository) GetMessages(ctx context.Context, chatID int64) ([]domain.ChatMessage, error) {
	query := `SELECT * FROM chat_messages WHERE chat_id = $1 ORDER BY created_at ASC`
	var msgs []domain.ChatMessage
	err := pgxscan.Select(ctx, r.pool, &msgs, query, chatID)
	return msgs, err
}
