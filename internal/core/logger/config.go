package core_logger

import (
	"fmt"

	"github.com/kelseyhightower/envconfig"
)

//настройки Logger | level - уровень логгирования: debug, info, warn, error | FOLDER - папка, куда писать логи, например ./logs
type LoggerConfig struct {
	Level string 	`envconfig:"LEVEL" required:"true"`
	Folder string	`envconfig:"FOLDER" required:"true"`
}

func NewConfig() (LoggerConfig, error) {
	var config LoggerConfig

	if err := envconfig.Process("LOGGER", &config);err != nil {// функция ищёт в переменные из окружения с префиком "LOGGER" и подставляет их
		return LoggerConfig{}, fmt.Errorf("process envconfig: %w", err)
	}

	return config, nil
}

//используется, чтобы не обрабатывать ошибки, которые появляются на этапе запуска.
func NewConfigMust() LoggerConfig {
	config, err := NewConfig()
	if err != nil {
		err = fmt.Errorf("get Logger config: %w", err)
		panic(err)
	}

	return config
}