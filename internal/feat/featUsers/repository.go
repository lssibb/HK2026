package users_service

import (
	"context"
	"errors"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UsersRepository interface {
	CreateUser(ctx context.Context, user domain.User) (domain.User, error)
	GetUserByUsername(ctx context.Context, username string) (domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (domain.User, error)
}

type postgresUserRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresUserRepository(pool *pgxpool.Pool) UsersRepository {
	return &postgresUserRepository{pool: pool}
}

func (r *postgresUserRepository) CreateUser(ctx context.Context, user domain.User) (domain.User, error) {
	query := `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, username, email, password_hash, created_at, updated_at
	`
	err := pgxscan.Get(ctx, r.pool, &user, query, user.Username, user.Email, user.PasswordHash)
	return user, err
}

func (r *postgresUserRepository) GetUserByUsername(ctx context.Context, username string) (domain.User, error) {
	query := `SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = $1`
	var user domain.User
	err := pgxscan.Get(ctx, r.pool, &user, query, username)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, errors.New("user not found")
	}
	return user, err
}

func (r *postgresUserRepository) GetUserByEmail(ctx context.Context, email string) (domain.User, error) {
	query := `SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE email = $1`
	var user domain.User
	err := pgxscan.Get(ctx, r.pool, &user, query, email)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, errors.New("user not found")
	}
	return user, err
}
