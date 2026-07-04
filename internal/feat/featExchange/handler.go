package exchange_service

import (
	"net/http"
	"strconv"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/exchange"
	"github.com/gin-gonic/gin"
)

type ExchangeHandler struct {
	service *ExchangeService
}

func NewExchangeHandler(service *ExchangeService) *ExchangeHandler {
	return &ExchangeHandler{service: service}
}

func (h *ExchangeHandler) RegisterRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	exchange := router.Group("/api/v1/exchange", authMiddleware)
	{
		exchange.GET("/listings", h.ListListings)
		exchange.POST("/listings", h.CreateListing)
		exchange.GET("/listings/:id", h.GetListing)
		exchange.PATCH("/listings/:id", h.UpdateListing)
		exchange.DELETE("/listings/:id", h.RemoveListing)

		exchange.GET("/listings/:id/messages", h.GetMessages)
		exchange.POST("/listings/:id/messages", h.SendMessage)
	}
}

func (h *ExchangeHandler) getUserID(c *gin.Context) (int64, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return 0, false
	}
	return userID.(int64), true
}

func (h *ExchangeHandler) ListListings(c *gin.Context) {
	exchanges, err := h.service.GetActiveExchanges(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get exchanges"})
		return
	}

	var response []ExchangeListingResponse
	for _, ex := range exchanges {
		response = append(response, mapExchangeToResponse(ex))
	}
	if response == nil {
		response = []ExchangeListingResponse{}
	}
	c.JSON(http.StatusOK, response)
}

func (h *ExchangeHandler) CreateListing(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var input CreateListingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plantID, err := strconv.ParseInt(input.PlantID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plantId"})
		return
	}

	ex := domain.PlantExchange{
		PlantID:             &plantID,
		PlantName:           input.Condition,
		Description:         input.Description,
		ExchangePreferences: &input.Wants,
	}

	created, err := h.service.CreateExchange(c.Request.Context(), userID, ex)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create exchange"})
		return
	}

	c.JSON(http.StatusCreated, mapExchangeToResponse(created))
}

func (h *ExchangeHandler) GetListing(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	ex, err := h.service.GetExchangeByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, mapExchangeToResponse(ex))
}

func (h *ExchangeHandler) UpdateListing(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input UpdateListingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patch := domain.PlantExchange{}
	if input.Status != nil {
		patch.Status = *input.Status
	}
	if input.Condition != nil {
		patch.PlantName = *input.Condition
	}
	if input.Description != nil {
		patch.Description = input.Description
	}
	if input.Wants != nil {
		patch.ExchangePreferences = input.Wants
	}

	updated, err := h.service.UpdateExchange(c.Request.Context(), id, patch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update"})
		return
	}

	c.JSON(http.StatusOK, mapExchangeToResponse(updated))
}

func (h *ExchangeHandler) RemoveListing(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.service.RemoveExchange(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove"})
		return
	}

	c.Status(http.StatusNoContent)
}

type sendMsgReq struct {
	Text string `json:"text" binding:"required"`
}

func (h *ExchangeHandler) SendMessage(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	listingIDStr := c.Param("id")
	exchangeID, err := strconv.ParseInt(listingIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid listing id"})
		return
	}

	var req sendMsgReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg, err := h.service.SendMessageToExchange(c.Request.Context(), userID, exchangeID, req.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send message"})
		return
	}

	c.JSON(http.StatusCreated, mapMessageToResponse(msg, listingIDStr))
}

func (h *ExchangeHandler) GetMessages(c *gin.Context) {
	listingIDStr := c.Param("id")
	exchangeID, err := strconv.ParseInt(listingIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid listing id"})
		return
	}

	msgs, err := h.service.GetMessagesByExchange(c.Request.Context(), exchangeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get messages"})
		return
	}

	var response []ExchangeMessageResponse
	for _, msg := range msgs {
		response = append(response, mapMessageToResponse(msg, listingIDStr))
	}
	if response == nil {
		response = []ExchangeMessageResponse{}
	}

	c.JSON(http.StatusOK, response)
}
