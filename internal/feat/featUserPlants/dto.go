package userplants_service

import (
	"fmt"
	"time"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user_plant"
)

type UserPlantResponse struct {
	ID                      string   `json:"id"`
	PlantID                 string   `json:"plantId"`
	Nickname                *string  `json:"nickname,omitempty"`
	DateAdded               string   `json:"dateAdded"`
	Notes                   *string  `json:"notes,omitempty"`
	WateringIntervalDays    *int     `json:"wateringIntervalDays,omitempty"`
	RepottingIntervalMonths *int     `json:"repottingIntervalMonths,omitempty"`
	RemindersEnabled        bool     `json:"remindersEnabled"`
	LastWateredAt           *string  `json:"lastWateredAt,omitempty"`
	LastRepottedAt          *string  `json:"lastRepottedAt,omitempty"`
}

type AddUserPlantInput struct {
	PlantID                 string   `json:"plantId"`
	Nickname                *string  `json:"nickname"`
	Notes                   *string  `json:"notes"`
	WateringIntervalDays    *int     `json:"wateringIntervalDays"`
	RepottingIntervalMonths *int     `json:"repottingIntervalMonths"`
	RemindersEnabled        *bool    `json:"remindersEnabled"`
	DateAdded               *string  `json:"dateAdded"`
}

type UpdateUserPlantInput struct {
	Nickname                *string  `json:"nickname"`
	Notes                   *string  `json:"notes"`
	WateringIntervalDays    *int     `json:"wateringIntervalDays"`
	RepottingIntervalMonths *int     `json:"repottingIntervalMonths"`
	RemindersEnabled        *bool    `json:"remindersEnabled"`
	LastWateredAt           *string  `json:"lastWateredAt"`
	LastRepottedAt          *string  `json:"lastRepottedAt"`
}

type CareActionInput struct {
	At *string `json:"at"`
}

func mapUserPlantToResponse(up domain.UserPlant) UserPlantResponse {
	plantIDStr := ""
	if up.PlantID != nil {
		plantIDStr = fmt.Sprint(*up.PlantID)
	}

	var repottingMonths *int
	if up.RepottingIntervalDays != nil {
		months := *up.RepottingIntervalDays / 30
		if months == 0 {
			months = 1
		}
		repottingMonths = &months
	}

	remindersEnabled := false
	if up.NextWateringDate != nil || up.NextRepottingDate != nil {
		remindersEnabled = true
	}

	var lastWatered *string
	if up.NextWateringDate != nil && up.WateringIntervalDays != nil {
		lw := up.NextWateringDate.AddDate(0, 0, -*up.WateringIntervalDays)
		lwStr := lw.Format(time.RFC3339)
		lastWatered = &lwStr
	}

	var lastRepotted *string
	if up.NextRepottingDate != nil && up.RepottingIntervalDays != nil {
		lr := up.NextRepottingDate.AddDate(0, 0, -*up.RepottingIntervalDays)
		lrStr := lr.Format(time.RFC3339)
		lastRepotted = &lrStr
	}

	return UserPlantResponse{
		ID:                      fmt.Sprint(up.ID),
		PlantID:                 plantIDStr,
		Nickname:                up.CustomName,
		DateAdded:               up.AddedDate.Format(time.RFC3339),
		Notes:                   up.Notes,
		WateringIntervalDays:    up.WateringIntervalDays,
		RepottingIntervalMonths: repottingMonths,
		RemindersEnabled:        remindersEnabled,
		LastWateredAt:           lastWatered,
		LastRepottedAt:          lastRepotted,
	}
}
