package user_plant

import "time"

type UserPlant struct {
	ID                    int64      `json:"id" db:"id"`
	UserID                int64      `json:"user_id" db:"user_id"`
	PlantID               *int64     `json:"plant_id" db:"plant_id"`
	CustomName            *string    `json:"custom_name" db:"custom_name"`
	Notes                 *string    `json:"notes" db:"notes"`
	WateringIntervalDays  *int       `json:"watering_interval_days" db:"watering_interval_days"`
	RepottingIntervalDays *int       `json:"repotting_interval_days" db:"repotting_interval_days"`
	NextWateringDate      *time.Time `json:"next_watering_date" db:"next_watering_date"`
	NextRepottingDate     *time.Time `json:"next_repotting_date" db:"next_repotting_date"`
	ImageURL              *string    `json:"image_url" db:"image_url"`
	AddedDate             time.Time  `json:"added_date" db:"added_date"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`
}

type FavoritePlant struct {
	UserID    int64     `json:"user_id" db:"user_id"`
	PlantID   int64     `json:"plant_id" db:"plant_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
