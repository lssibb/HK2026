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
	GetExchangeByID(ctx context.Context, id int64) (domain.PlantExchange, error)
	UpdateExchange(ctx context.Context, id int64, patch domain.PlantExchange) (domain.PlantExchange, error)
	RemoveExchange(ctx context.Context, id int64) error
	CreateChat(ctx context.Context, chat domain.ExchangeChat) (domain.ExchangeChat, error)
	GetChatsByUser(ctx context.Context, userID int64) ([]domain.ExchangeChat, error)
	SendMessage(ctx context.Context, msg domain.ChatMessage) (domain.ChatMessage, error)
	GetMessages(ctx context.Context, chatID int64) ([]domain.ChatMessage, error)
	GetMessagesByExchange(ctx context.Context, exchangeID int64) ([]domain.ChatMessage, error)
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

func (r *postgresExchangeRepository) GetExchangeByID(ctx context.Context, id int64) (domain.PlantExchange, error) {
	query := `SELECT * FROM plant_exchanges WHERE id = $1`
	var ex domain.PlantExchange
	err := pgxscan.Get(ctx, r.pool, &ex, query, id)
	return ex, err
}

func (r *postgresExchangeRepository) UpdateExchange(ctx context.Context, id int64, patch domain.PlantExchange) (domain.PlantExchange, error) {
	query := `
		UPDATE plant_exchanges
		SET status = COALESCE(NULLIF($2, ''), status),
			plant_name = COALESCE(NULLIF($3, ''), plant_name),
			description = COALESCE($4, description),
			exchange_preferences = COALESCE($5, exchange_preferences),
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING *
	`
	var updated domain.PlantExchange
	err := pgxscan.Get(ctx, r.pool, &updated, query, id, patch.Status, patch.PlantName, patch.Description, patch.ExchangePreferences)
	return updated, err
}

func (r *postgresExchangeRepository) RemoveExchange(ctx context.Context, id int64) error {
	query := `DELETE FROM plant_exchanges WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *postgresExchangeRepository) GetMessagesByExchange(ctx context.Context, exchangeID int64) ([]domain.ChatMessage, error) {
	query := `
		SELECT m.* FROM chat_messages m
		JOIN exchange_chats c ON m.chat_id = c.id
		WHERE c.exchange_id = $1
		ORDER BY m.created_at ASC
	`
	var msgs []domain.ChatMessage
	err := pgxscan.Select(ctx, r.pool, &msgs, query, exchangeID)
	return msgs, err
}
