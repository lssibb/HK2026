package exchange

import "time"

type PlantExchange struct {
	ID                  int64     `json:"id" db:"id"`
	UserID              int64     `json:"user_id" db:"user_id"`
	PlantName           string    `json:"plant_name" db:"plant_name"`
	PlantID             *int64    `json:"plant_id" db:"plant_id"`
	Description         *string   `json:"description" db:"description"`
	ExchangePreferences *string   `json:"exchange_preferences" db:"exchange_preferences"`
	Status              string    `json:"status" db:"status"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}

type ExchangeChat struct {
	ID          int64     `json:"id" db:"id"`
	ExchangeID  int64     `json:"exchange_id" db:"exchange_id"`
	InitiatorID int64     `json:"initiator_id" db:"initiator_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type ChatMessage struct {
	ID        int64     `json:"id" db:"id"`
	ChatID    int64     `json:"chat_id" db:"chat_id"`
	SenderID  int64     `json:"sender_id" db:"sender_id"`
	Message   string    `json:"message" db:"message"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
