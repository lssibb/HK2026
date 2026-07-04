package exchange_service

import (
	"fmt"
	"time"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/exchange"
)

type ExchangeListingResponse struct {
	ID          string `json:"id"`
	PlantID     string `json:"plantId"`
	OwnerID     string `json:"ownerId"`
	OwnerName   string `json:"ownerName"`
	Condition   string `json:"condition"`
	Description string `json:"description,omitempty"`
	Wants       string `json:"wants"`
	City        string `json:"city,omitempty"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

type CreateListingInput struct {
	PlantID     string  `json:"plantId"`
	Condition   string  `json:"condition"`
	Description *string `json:"description"`
	Wants       string  `json:"wants"`
	City        *string `json:"city"`
}

type UpdateListingInput struct {
	Status      *string `json:"status"`
	Condition   *string `json:"condition"`
	Description *string `json:"description"`
	Wants       *string `json:"wants"`
	City        *string `json:"city"`
}

type ExchangeMessageResponse struct {
	ID         string `json:"id"`
	ListingID  string `json:"listingId"`
	AuthorID   string `json:"authorId"`
	AuthorName string `json:"authorName"`
	Text       string `json:"text"`
	CreatedAt  string `json:"createdAt"`
}

func mapExchangeToResponse(ex domain.PlantExchange) ExchangeListingResponse {
	plantIDStr := ""
	if ex.PlantID != nil {
		plantIDStr = fmt.Sprint(*ex.PlantID)
	}
	
	desc := ""
	if ex.Description != nil {
		desc = *ex.Description
	}

	wants := ""
	if ex.ExchangePreferences != nil {
		wants = *ex.ExchangePreferences
	}

	return ExchangeListingResponse{
		ID:          fmt.Sprint(ex.ID),
		PlantID:     plantIDStr,
		OwnerID:     fmt.Sprint(ex.UserID),
		OwnerName:   "Пользователь", // Hardcoded fallback for now since DB lacks user join
		Condition:   ex.PlantName, // DB stores condition in plant_name field in this implementation
		Description: desc,
		Wants:       wants,
		City:        "",
		Status:      ex.Status,
		CreatedAt:   ex.CreatedAt.Format(time.RFC3339),
	}
}

func mapMessageToResponse(msg domain.ChatMessage, listingID string) ExchangeMessageResponse {
	return ExchangeMessageResponse{
		ID:         fmt.Sprint(msg.ID),
		ListingID:  listingID,
		AuthorID:   fmt.Sprint(msg.SenderID),
		AuthorName: "Пользователь",
		Text:       msg.Message,
		CreatedAt:  msg.CreatedAt.Format(time.RFC3339),
	}
}
