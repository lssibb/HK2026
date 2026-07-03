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
	protected := router.Group("/api/v1/exchange", authMiddleware)
	{
		protected.POST("/ads", h.CreateExchange)
		protected.GET("/ads", h.GetActiveExchanges)
		
		protected.POST("/chats", h.CreateChat)
		protected.GET("/chats", h.GetChats)
		
		protected.POST("/chats/:chat_id/messages", h.SendMessage)
		protected.GET("/chats/:chat_id/messages", h.GetMessages)
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

func (h *ExchangeHandler) CreateExchange(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var ex domain.PlantExchange
	if err := c.ShouldBindJSON(&ex); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, err := h.service.CreateExchange(c.Request.Context(), userID, ex)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create exchange ad"})
		return
	}

	c.JSON(http.StatusCreated, created)
}

func (h *ExchangeHandler) GetActiveExchanges(c *gin.Context) {
	exchanges, err := h.service.GetActiveExchanges(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get exchanges"})
		return
	}

	c.JSON(http.StatusOK, exchanges)
}

type createChatReq struct {
	ExchangeID int64 `json:"exchange_id" binding:"required"`
}

func (h *ExchangeHandler) CreateChat(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	var req createChatReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chat, err := h.service.CreateChat(c.Request.Context(), userID, req.ExchangeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create chat"})
		return
	}

	c.JSON(http.StatusCreated, chat)
}

func (h *ExchangeHandler) GetChats(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	chats, err := h.service.GetChatsByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get chats"})
		return
	}

	c.JSON(http.StatusOK, chats)
}

type sendMsgReq struct {
	Message string `json:"message" binding:"required"`
}

func (h *ExchangeHandler) SendMessage(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok { return }

	chatIDParam := c.Param("chat_id")
	chatID, err := strconv.ParseInt(chatIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}

	var req sendMsgReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg, err := h.service.SendMessage(c.Request.Context(), userID, chatID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send message"})
		return
	}

	c.JSON(http.StatusCreated, msg)
}

func (h *ExchangeHandler) GetMessages(c *gin.Context) {
	_, ok := h.getUserID(c)
	if !ok { return }

	chatIDParam := c.Param("chat_id")
	chatID, err := strconv.ParseInt(chatIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}

	msgs, err := h.service.GetMessages(c.Request.Context(), chatID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get messages"})
		return
	}

	c.JSON(http.StatusOK, msgs)
}
