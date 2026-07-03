package users_service

import (
	"net/http"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user"
	"github.com/lssibb/Sweet-Garden-HITS/internal/utils"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service   *UsersService
	jwtSecret string
}

func NewAuthHandler(service *UsersService, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		service:   service,
		jwtSecret: jwtSecret,
	}
}

func (h *AuthHandler) RegisterRoutes(router *gin.Engine) {
	authGroup := router.Group("/api/v1/auth")
	{
		authGroup.POST("/register", h.Register)
		authGroup.POST("/login", h.Login)
	}
}

type registerRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := domain.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: req.Password,
	}

	createdUser, err := h.service.CreateUser(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdUser)
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	token, err := utils.GenerateToken(user.ID, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}
