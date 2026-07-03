package logger

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger struct {
	*zap.Logger
	file *os.File
}

var globalLogger *Logger

func Get() *Logger {
	if globalLogger == nil {
		return &Logger{Logger: zap.NewNop()}
	}
	return globalLogger
}

type reqIDKey struct{}

func WithRequestID(ctx context.Context, reqID string) context.Context {
	return context.WithValue(ctx, reqIDKey{}, reqID)
}

func FromContext(ctx context.Context) *Logger {
	reqID, ok := ctx.Value(reqIDKey{}).(string)
	if ok && reqID != "" {
		return Get().With(zap.String("request_id", reqID))
	}
	return Get()
}

func NewLogger(config LoggerConfig) (*Logger, error) {
	zapLvl := zap.NewAtomicLevel()
	if err := zapLvl.UnmarshalText([]byte(config.Level)); err != nil {
		return nil, fmt.Errorf("unmarshal log level: %w", err)
	}

	if err := os.MkdirAll(config.Folder, 0755); err != nil {
		return nil, fmt.Errorf("mkdir log folder: %w", err)
	}

	timestamp := time.Now().UTC().Format("2006-01-02T15-04-05.000000")
	logFilePath := filepath.Join(config.Folder, fmt.Sprintf("%s.log", timestamp))

	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("open log file: %w", err)
	}

	zapConfig := zap.NewDevelopmentEncoderConfig()
	zapConfig.EncodeTime = zapcore.TimeEncoderOfLayout("2006-01-02T15:04:05.000000")
	zapConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder

	fileZapConfig := zapConfig
	fileZapConfig.EncodeLevel = zapcore.CapitalLevelEncoder

	consoleEncoder := zapcore.NewConsoleEncoder(zapConfig)
	fileEncoder := zapcore.NewConsoleEncoder(fileZapConfig)

	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(os.Stdout), zapLvl),
		zapcore.NewCore(fileEncoder, zapcore.AddSync(logFile), zapLvl),
	)

	zapLogger := zap.New(core, zap.AddCaller())

	loggerInstance := &Logger{
		Logger: zapLogger,
		file:   logFile,
	}
	globalLogger = loggerInstance

	return loggerInstance, nil
}

func (l *Logger) Close() {
	if l.file != nil {
		if err := l.file.Close(); err != nil {
			fmt.Println("Failed to close application to logger: ", err)
		}
	}
}

func (l *Logger) With(field ...zap.Field) *Logger {
	return &Logger{
		Logger: l.Logger.With(field...),
		file:   l.file,
	}
}
