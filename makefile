include .env
export

PROJECT_ROOT := $(CURDIR)
export PROJECT_ROOT

.PHONY: env-up env-down env-clean-up

env-up:
	@docker compose up -d sweetGarden-postgres

env-down:
	@docker compose down

env-clean-up:
	@printf "Очистить все файлы окружения? Возможна потеря данных. [y/N]: "; \
	read ans; \
	if [ "$$ans" = "y" ]; then \
		docker compose down && \
		rm -rf out/pgdata && \
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
	@docker compose run --rm sweetGarden-postgres-migrate \
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

	docker compose run --rm sweetGarden-postgres-migrate \
		-path /migrations \
		-database "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@sweetGarden-postgres:5432/${POSTGRES_DB}?sslmode=disable" \
		"$(action)"

sweetGarden-run:
	@export LOGGER_FOLDER=${PROJECT_ROOT}/out/logs && \
	go run ./cmd/sweetGarden