package users_service

import (
	"context"
	"fmt"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user"
	"github.com/lssibb/Sweet-Garden-HITS/internal/utils"
)

func (s *UsersService) CreateUser(
	ctx context.Context,
	user domain.User,
) (domain.User, error) {
	if err := user.Validate(); err != nil {
		return domain.User{}, fmt.Errorf("Validate user domain: %w", err)
	}

	hashedPassword, err := utils.HashPassword(user.PasswordHash)
	if err != nil {
		return domain.User{}, fmt.Errorf("failed to hash password: %w", err)
	}
	user.PasswordHash = hashedPassword

	user, err = s.usersRepository.CreateUser(ctx, user)
	if err != nil {
		return domain.User{}, fmt.Errorf("invalid create user: %w", err)
	}

	return user, nil
}
