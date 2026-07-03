package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/lssibb/Sweet-Garden-HITS/internal/core/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func PanicRecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				reqLogger := logger.FromContext(c.Request.Context())
				reqLogger.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("stack", string(debug.Stack())),
				)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "internal server error",
				})
			}
		}()
		
		c.Next()
	}
}
