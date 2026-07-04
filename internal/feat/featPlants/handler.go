package plants_service

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PlantsHandler struct {
	service *PlantsService
}

func NewPlantsHandler(service *PlantsService) *PlantsHandler {
	return &PlantsHandler{service: service}
}

func (h *PlantsHandler) RegisterRoutes(router *gin.Engine) {
	plantsGroup := router.Group("/api/v1/plants")
	{
		plantsGroup.GET("", h.ListPlants)
		plantsGroup.GET("/:id", h.GetPlant)
	}
}

func (h *PlantsHandler) ListPlants(c *gin.Context) {
	searchQuery := c.Query("q")
	
	plants, err := h.service.GetPlants(c.Request.Context(), searchQuery)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get plants"})
		return
	}

	var response []PlantResponse
	for _, p := range plants {
		response = append(response, mapPlantToResponse(p))
	}
	if response == nil {
		response = []PlantResponse{}
	}

	c.JSON(http.StatusOK, response)
}

func (h *PlantsHandler) GetPlant(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plant id"})
		return
	}

	plant, err := h.service.GetPlantByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mapPlantToResponse(plant))
}
