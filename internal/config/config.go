package config

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ServerPort string `envconfig:"SERVER_PORT" default:"8080"`
	DBURL      string `envconfig:"DB_URL" required:"true"`
	JWTSecret  string `envconfig:"JWT_SECRET" required:"true"`
}

func LoadConfig() *Config {
	_ = godotenv.Load() // ignoring error in case file doesn't exist

	var cfg Config
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatalf("Failed to process config: %v", err)
	}

	return &cfg
}
