package middleware

import (
	"time"

	"github.com/lssibb/Sweet-Garden-HITS/internal/core/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func TraceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		c.Next()
		
		duration := time.Since(start)
		statusCode := c.Writer.Status()
		
		reqLogger := logger.FromContext(c.Request.Context())
		
		if len(c.Errors) > 0 {
			reqLogger.Error("Request failed",
				zap.Int("status", statusCode),
				zap.Duration("duration", duration),
				zap.String("errors", c.Errors.String()),
			)
		} else {
			reqLogger.Info("Request finished",
				zap.Int("status", statusCode),
				zap.Duration("duration", duration),
			)
		}
	}
}
