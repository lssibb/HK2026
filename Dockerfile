FROM golang:1.26-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy application source
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /api ./cmd/api

FROM alpine:latest

WORKDIR /

COPY --from=builder /api /api

EXPOSE 8080

ENTRYPOINT ["/api"]
