package plant

import "time"

type Plant struct {
	ID                       int64     `json:"id" db:"id"`
	Name                     string    `json:"name" db:"name"`
	WateringRecommendations  *string   `json:"watering_recommendations" db:"watering_recommendations"`
	LightingRecommendations  *string   `json:"lighting_recommendations" db:"lighting_recommendations"`
	RepottingInfo            *string   `json:"repotting_info" db:"repotting_info"`
	ToxicityInfo             *string   `json:"toxicity_info" db:"toxicity_info"`
	AdditionalFeatures       *string   `json:"additional_features" db:"additional_features"`
	ImageURL                 *string   `json:"image_url" db:"image_url"`
	CreatedAt                time.Time `json:"created_at" db:"created_at"`
	UpdatedAt                time.Time `json:"updated_at" db:"updated_at"`
}
