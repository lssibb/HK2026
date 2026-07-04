package plants_service

import (
	"fmt"
	"strings"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/plant"
)

type PlantResponse struct {
	ID                      string   `json:"id"`
	Name                    string   `json:"name"`
	LatinName               *string  `json:"latinName,omitempty"`
	ImageURL                *string  `json:"imageUrl,omitempty"`
	Watering                string   `json:"watering"`
	WateringIntervalDays    *int     `json:"wateringIntervalDays,omitempty"`
	Light                   string   `json:"light"`
	LightNote               *string  `json:"lightNote,omitempty"`
	Repotting               string   `json:"repotting"`
	RepottingIntervalMonths *int     `json:"repottingIntervalMonths,omitempty"`
	Toxic                   bool     `json:"toxic"`
	ToxicityNote            *string  `json:"toxicityNote,omitempty"`
	Features                []string `json:"features,omitempty"`
	Tags                    []string `json:"tags,omitempty"`
}

func mapPlantToResponse(p domain.Plant) PlantResponse {
	var features []string
	if p.AdditionalFeatures != nil && *p.AdditionalFeatures != "" {
		features = []string{*p.AdditionalFeatures}
	} else {
		features = []string{}
	}

	toxic := false
	var toxicityNote *string
	if p.ToxicityInfo != nil {
		lowerTox := strings.ToLower(*p.ToxicityInfo)
		if strings.Contains(lowerTox, "токсичн") || strings.Contains(lowerTox, "ядовит") {
			toxic = true
		}
		if *p.ToxicityInfo != "" {
			toxicityNote = p.ToxicityInfo
		}
	}

	light := "bright"
	var lightNote *string
	if p.LightingRecommendations != nil {
		lowerLight := strings.ToLower(*p.LightingRecommendations)
		if strings.Contains(lowerLight, "тен") {
			light = "low"
		} else if strings.Contains(lowerLight, "полутен") {
			light = "medium"
		} else if strings.Contains(lowerLight, "прям") {
			light = "direct"
		}
		if *p.LightingRecommendations != "" {
			lightNote = p.LightingRecommendations
		}
	}

	var imgUrl *string
	if p.ImageURL != nil && *p.ImageURL != "" {
		path := *p.ImageURL
		if !strings.HasPrefix(path, "http") && !strings.HasPrefix(path, "/") {
			path = "/" + path
		}
		imgUrl = &path
	}

	watering := ""
	if p.WateringRecommendations != nil {
		watering = *p.WateringRecommendations
	}

	repotting := ""
	if p.RepottingInfo != nil {
		repotting = *p.RepottingInfo
	}

	return PlantResponse{
		ID:           fmt.Sprint(p.ID),
		Name:         p.Name,
		ImageURL:     imgUrl,
		Watering:     watering,
		Light:        light,
		LightNote:    lightNote,
		Repotting:    repotting,
		Toxic:        toxic,
		ToxicityNote: toxicityNote,
		Features:     features,
		Tags:         []string{},
	}
}
