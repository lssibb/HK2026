package userplants_service

import (
	"net/http"
	"strconv"
	"time"

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
	userPlants := router.Group("/api/v1/user-plants", authMiddleware)
	{
		userPlants.GET("", h.ListUserPlants)
		userPlants.POST("", h.AddUserPlant)
		userPlants.GET("/:id", h.GetUserPlant)
		userPlants.PATCH("/:id", h.UpdateUserPlant)
		userPlants.DELETE("/:id", h.RemoveUserPlant)
		userPlants.POST("/:id/water", h.MarkWatered)
		userPlants.POST("/:id/repot", h.MarkRepotted)
	}

	favorites := router.Group("/api/v1/favorites", authMiddleware)
	{
		favorites.GET("", h.ListFavorites)
		favorites.POST("", h.AddFavorite)
		favorites.DELETE("/:plantId", h.RemoveFavorite)
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

func (h *UserPlantsHandler) ListUserPlants(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	plants, err := h.service.GetUserPlants(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user plants"})
		return
	}

	var response []UserPlantResponse
	for _, p := range plants {
		response = append(response, mapUserPlantToResponse(p))
	}
	if response == nil {
		response = []UserPlantResponse{}
	}
	c.JSON(http.StatusOK, response)
}

func (h *UserPlantsHandler) AddUserPlant(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var input AddUserPlantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plantID, err := strconv.ParseInt(input.PlantID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plantId"})
		return
	}

	var repottingDays *int
	if input.RepottingIntervalMonths != nil {
		days := *input.RepottingIntervalMonths * 30
		repottingDays = &days
	}

	addedDate := time.Now()
	if input.DateAdded != nil {
		if parsed, err := time.Parse(time.RFC3339, *input.DateAdded); err == nil {
			addedDate = parsed
		}
	}

	plant := domain.UserPlant{
		PlantID:               &plantID,
		CustomName:            input.Nickname,
		Notes:                 input.Notes,
		WateringIntervalDays:  input.WateringIntervalDays,
		RepottingIntervalDays: repottingDays,
		AddedDate:             addedDate,
	}

	created, err := h.service.AddUserPlant(c.Request.Context(), userID, plant)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add plant to collection"})
		return
	}

	c.JSON(http.StatusCreated, mapUserPlantToResponse(created))
}

func (h *UserPlantsHandler) GetUserPlant(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	plant, err := h.service.GetUserPlantByID(c.Request.Context(), userID, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, mapUserPlantToResponse(plant))
}

func (h *UserPlantsHandler) UpdateUserPlant(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input UpdateUserPlantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var repottingDays *int
	if input.RepottingIntervalMonths != nil {
		days := *input.RepottingIntervalMonths * 30
		repottingDays = &days
	}

	var nextWatering *time.Time
	if input.LastWateredAt != nil && input.WateringIntervalDays != nil {
		if lw, err := time.Parse(time.RFC3339, *input.LastWateredAt); err == nil {
			nw := lw.AddDate(0, 0, *input.WateringIntervalDays)
			nextWatering = &nw
		}
	}

	var nextRepotting *time.Time
	if input.LastRepottedAt != nil && repottingDays != nil {
		if lr, err := time.Parse(time.RFC3339, *input.LastRepottedAt); err == nil {
			nr := lr.AddDate(0, 0, *repottingDays)
			nextRepotting = &nr
		}
	}

	patch := domain.UserPlant{
		CustomName:            input.Nickname,
		Notes:                 input.Notes,
		WateringIntervalDays:  input.WateringIntervalDays,
		RepottingIntervalDays: repottingDays,
		NextWateringDate:      nextWatering,
		NextRepottingDate:     nextRepotting,
	}

	updated, err := h.service.UpdateUserPlant(c.Request.Context(), userID, id, patch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update"})
		return
	}

	c.JSON(http.StatusOK, mapUserPlantToResponse(updated))
}

func (h *UserPlantsHandler) RemoveUserPlant(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.service.RemoveUserPlant(c.Request.Context(), userID, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *UserPlantsHandler) MarkWatered(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input CareActionInput
	_ = c.ShouldBindJSON(&input) // optional

	at := time.Now()
	if input.At != nil {
		if parsed, err := time.Parse(time.RFC3339, *input.At); err == nil {
			at = parsed
		}
	}

	updated, err := h.service.MarkWatered(c.Request.Context(), userID, id, at)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update"})
		return
	}

	c.JSON(http.StatusOK, mapUserPlantToResponse(updated))
}

func (h *UserPlantsHandler) MarkRepotted(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input CareActionInput
	_ = c.ShouldBindJSON(&input) // optional

	at := time.Now()
	if input.At != nil {
		if parsed, err := time.Parse(time.RFC3339, *input.At); err == nil {
			at = parsed
		}
	}

	updated, err := h.service.MarkRepotted(c.Request.Context(), userID, id, at)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update"})
		return
	}

	c.JSON(http.StatusOK, mapUserPlantToResponse(updated))
}

type addFavoriteReq struct {
	PlantID string `json:"plantId" binding:"required"`
}

func (h *UserPlantsHandler) AddFavorite(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var req addFavoriteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plantID, err := strconv.ParseInt(req.PlantID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plantId"})
		return
	}

	if err := h.service.AddFavorite(c.Request.Context(), userID, plantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add favorite"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *UserPlantsHandler) ListFavorites(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	plantIDs, err := h.service.GetFavorites(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get favorites"})
		return
	}

	var response []string
	for _, id := range plantIDs {
		response = append(response, strconv.FormatInt(id, 10))
	}
	if response == nil {
		response = []string{}
	}

	c.JSON(http.StatusOK, response)
}

func (h *UserPlantsHandler) RemoveFavorite(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	plantID, err := strconv.ParseInt(c.Param("plantId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plantId"})
		return
	}

	if err := h.service.RemoveFavorite(c.Request.Context(), userID, plantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove favorite"})
		return
	}

	c.Status(http.StatusNoContent)
}
