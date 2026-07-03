package core_http_middleware

import (
	"context"
	"net/http"
	"time"

	core_logger "github.com/KyoshiBlame/TodoKy/internal/core/logger"
	core_http_response "github.com/KyoshiBlame/TodoKy/internal/core/transport/http/response"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

const RequestIDHeader = "X-Request-ID"

//middleware для идентификации запросов для удобства логов
func RequestID() Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){

			requestID := r.Header.Get(RequestIDHeader)
			if requestID == "" {
				requestID = uuid.NewString()
			}

			r.Header.Set(RequestIDHeader, requestID)
			w.Header().Set(RequestIDHeader, requestID)
			
			next.ServeHTTP(w,r)

		})
	}
}

//logger
func Logger(log *core_logger.Logger) Middleware {
	return func (next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
			RequestID := r.Header.Get(RequestIDHeader)
			
			//Переопределил метод With чтобы возвращала мой логгер
			l := log.With(
				zap.String("request_id", RequestID),
				zap.String("url", r.URL.String()),
			)
			
			ctx := context.WithValue(r.Context(), "log", l)//по ключу log передаём наш логгер

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

//ловец-обработчик паник которые могут появиться после иполнения запроса
func Panic() Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
			ctx := r.Context()
			//получаем логгер через контекст
			log := core_logger.FromContext(ctx)

			responseHandler := core_http_response.NewHTTPResponseHandler(log, w)

			defer func () {
				if p := recover(); p != nil {
					responseHandler.PanicResponse(
						p, 
						"during, handle HTTP request got unexpected panic",
					)
				}
			}()

			next.ServeHTTP(w,r)
		})
	}
}

//логирование общеё информации о запросах
func Trace() Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){

			ctx := r.Context()
			log := core_logger.FromContext(ctx)
			//для получения статус кода выполения обработчика создали свой ResponseWriter
			rw := core_http_response.NewResponseWriter(w)

			before := time.Now()

			log.Debug(
				">>> incoming HTTP request",
				zap.Time("time", time.Now().UTC()),
			)

			next.ServeHTTP(rw,r)

			log.Debug(
				"<<< done HTTP request",
				zap.Int("Status code ", rw.GetStatusCodeOrPanic()),
				//счиатаем сколько время заняло выполнения запроса
				zap.Duration("latency", time.Since(before)),
			)
		})
	} 
}