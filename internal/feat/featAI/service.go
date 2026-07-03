package ai_service

import (
	"context"
	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/plant"
)

type AIService struct {
	repo AIRepository
}

func NewAIService(repo AIRepository) *AIService {
	return &AIService{repo: repo}
}

func (s *AIService) GetRecommendations(ctx context.Context, userID int64) ([]domain.Plant, error) {
	return s.repo.GetRecommendations(ctx, userID)
}

type RecognitionResult struct {
	PlantID    int64   `json:"plant_id"`
	PlantName  string  `json:"plant_name"`
	Confidence float64 `json:"confidence"`
}

func (s *AIService) RecognizePlantMock(ctx context.Context, fileBytes []byte) (RecognitionResult, error) {
	// Mock recognition logic
	return RecognitionResult{
		PlantID:    1, // Mocked ID
		PlantName:  "Монстера деликатесная (Mocked)",
		Confidence: 0.98,
	}, nil
}
