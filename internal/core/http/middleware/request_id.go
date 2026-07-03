package middleware

import (
	"github.com/lssibb/Sweet-Garden-HITS/internal/core/logger"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.NewString()
		}
		c.Header("X-Request-ID", reqID)

		ctx := logger.WithRequestID(c.Request.Context(), reqID)
		c.Request = c.Request.WithContext(ctx)

		c.Set("requestID", reqID)

		c.Next()
	}
}
