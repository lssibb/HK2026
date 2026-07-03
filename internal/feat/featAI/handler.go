package ai_service

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AIHandler struct {
	service *AIService
}

func NewAIHandler(service *AIService) *AIHandler {
	return &AIHandler{service: service}
}

func (h *AIHandler) RegisterRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	protected := router.Group("/api/v1/ai", authMiddleware)
	{
		protected.GET("/recommendations", h.GetRecommendations)
		protected.POST("/recognize", h.RecognizePlant)
	}
}

func (h *AIHandler) getUserID(c *gin.Context) (int64, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return 0, false
	}
	return userID.(int64), true
}

func (h *AIHandler) GetRecommendations(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	plants, err := h.service.GetRecommendations(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get recommendations"})
		return
	}

	c.JSON(http.StatusOK, plants)
}

func (h *AIHandler) RecognizePlant(c *gin.Context) {
	_, ok := h.getUserID(c)
	if !ok { return }

	file, _, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required in form-data under key 'image'"})
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read image file"})
		return
	}

	result, err := h.service.RecognizePlantMock(c.Request.Context(), fileBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "recognition failed"})
		return
	}

	c.JSON(http.StatusOK, result)
}
