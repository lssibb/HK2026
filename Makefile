include .env
export

PROJECT_ROOT := $(CURDIR)
export PROJECT_ROOT

.PHONY: env-up env-down env-clean-up env-port-forward env-port-close migrate-create migrate-up migrate-down api-run

env-up:
	@docker compose up -d postgres

env-down:
	@docker compose down

env-clean-up:
	@printf "Очистить все файлы окружения? Возможна потеря данных. [y/N]: "; \
	read ans; \
	if [ "$$ans" = "y" ]; then \
		docker compose down -v && \
		echo "Файлы окружения очищены"; \
	else \
		echo "Очистка окружения отменена"; \
	fi

env-port-forward:
	@docker compose up -d port-forwarder

env-port-close:
	@docker compose down port-forwarder

migrate-create:
	@if [ -z "$(seq)" ]; then \
		echo "Отсутствует параметр seq. Пример команды: make migrate-create seq=example"; \
		exit 1; \
	fi
	@docker compose run --rm migrate \
		create -ext sql -dir /migrations -seq "$(seq)"

migrate-up:
	make migrate-action action=up

migrate-down:
	make migrate-action action=down

migrate-action:
	@if [ -z "$(action)" ]; then \
		echo "Отсутствует параметр action."; \
		exit 1; \
	fi
	docker compose run --rm migrate \
		-path /migrations \
		-database "postgres://${POSTGRES_USER:-root}:${POSTGRES_PASSWORD:-root}@postgres:5432/${POSTGRES_DB:-plantcare}?sslmode=disable" \
		"$(action)"

api-run:
	@export LOGGER_FOLDER=${PROJECT_ROOT}/logs && \
	go run ./cmd/api
