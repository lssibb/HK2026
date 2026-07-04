package main

import (
	"context"
	"net/http"

	"github.com/lssibb/Sweet-Garden-HITS/internal/config"
	ai_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featAI"
	exchange_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featExchange"
	plants_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featPlants"
	userplants_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featUserPlants"
	users_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featUsers"
	"github.com/lssibb/Sweet-Garden-HITS/internal/infrastructure/db"
	"github.com/lssibb/Sweet-Garden-HITS/internal/core/http/middleware"
	"github.com/lssibb/Sweet-Garden-HITS/internal/core/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	cfg := config.LoadConfig()

	loggerConfig := logger.NewConfigMust()
	log, err := logger.NewLogger(loggerConfig)
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer log.Close()

	log.Info("Starting application", zap.String("port", cfg.ServerPort))

	database, err := db.ConnectPostgres(context.Background(), cfg.DBURL)
	if err != nil {
		log.Fatal("Database connection failed", zap.Error(err))
	}
	defer database.Close()
	log.Info("Connected to PostgreSQL database successfully.")

	// Init Repositories
	userRepo := users_service.NewPostgresUserRepository(database)
	plantsRepo := plants_service.NewPostgresPlantsRepository(database)
	userPlantsRepo := userplants_service.NewPostgresUserPlantsRepository(database)
	exchangeRepo := exchange_service.NewPostgresExchangeRepository(database)
	aiRepo := ai_service.NewPostgresAIRepository(database)

	// Init Services
	userService := users_service.NewUsersService(userRepo)
	plantsService := plants_service.NewPlantsService(plantsRepo)
	userPlantsService := userplants_service.NewUserPlantsService(userPlantsRepo)
	exchangeService := exchange_service.NewExchangeService(exchangeRepo)
	aiService := ai_service.NewAIService(aiRepo)

	// Init Handlers
	authHandler := users_service.NewAuthHandler(userService, cfg.JWTSecret)
	plantsHandler := plants_service.NewPlantsHandler(plantsService)
	userPlantsHandler := userplants_service.NewUserPlantsHandler(userPlantsService)
	exchangeHandler := exchange_service.NewExchangeHandler(exchangeService)
	aiHandler := ai_service.NewAIHandler(aiService)

	router := gin.New() // New instead of Default to avoid default logger/recovery
	
	// Add Global Middlewares Chain
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.TraceMiddleware())
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.PanicRecoveryMiddleware())

	// Serve static files
	router.Static("/static", "./static")

	// Auth Middleware
	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret)

	// Register Routes
	authHandler.RegisterRoutes(router)
	plantsHandler.RegisterRoutes(router)
	userPlantsHandler.RegisterRoutes(router, authMiddleware)
	exchangeHandler.RegisterRoutes(router, authMiddleware)
	aiHandler.RegisterRoutes(router, authMiddleware)

	// Simple health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	log.Info("Server is starting", zap.String("port", cfg.ServerPort))
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatal("Failed to start server", zap.Error(err))
	}
}
