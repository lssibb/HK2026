package middleware

import (
	"github.com/lssibb/Sweet-Garden-HITS/internal/core/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqLogger := logger.FromContext(c.Request.Context())
		
		reqLogger.Info("Incoming request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.String("client_ip", c.ClientIP()),
			zap.String("user_agent", c.Request.UserAgent()),
		)

		c.Next()
		
		reqLogger.Debug("Completed request logic")
	}
}
