package userplants_service

import (
	"net/http"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user_plant"
	"github.com/gin-gonic/gin"
)

type UserPlantsHandler struct {
	service *UserPlantsService
}

func NewUserPlantsHandler(service *UserPlantsService) *UserPlantsHandler {
	return &UserPlantsHandler{service: service}
}

func (h *UserPlantsHandler) RegisterRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	protected := router.Group("/api/v1/user", authMiddleware)
	{
		protected.POST("/plants", h.AddUserPlant)
		protected.GET("/plants", h.GetUserPlants)
		
		protected.POST("/favorites", h.AddFavorite)
		protected.GET("/favorites", h.GetFavorites)
		
		protected.GET("/reminders", h.GetReminders)
	}
}

func (h *UserPlantsHandler) getUserID(c *gin.Context) (int64, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return 0, false
	}
	return userID.(int64), true
}

func (h *UserPlantsHandler) AddUserPlant(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var plant domain.UserPlant
	if err := c.ShouldBindJSON(&plant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, err := h.service.AddUserPlant(c.Request.Context(), userID, plant)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add plant to personal collection"})
		return
	}

	c.JSON(http.StatusCreated, created)
}

func (h *UserPlantsHandler) GetUserPlants(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	plants, err := h.service.GetUserPlants(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user plants"})
		return
	}

	c.JSON(http.StatusOK, plants)
}

type addFavoriteReq struct {
	PlantID int64 `json:"plant_id" binding:"required"`
}

func (h *UserPlantsHandler) AddFavorite(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var req addFavoriteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.AddFavorite(c.Request.Context(), userID, req.PlantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "added to favorites"})
}

func (h *UserPlantsHandler) GetFavorites(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	plantIDs, err := h.service.GetFavorites(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get favorites"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"favorite_plant_ids": plantIDs})
}

func (h *UserPlantsHandler) GetReminders(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	reminders, err := h.service.GetReminders(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get reminders"})
		return
	}

	c.JSON(http.StatusOK, reminders)
}
