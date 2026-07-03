package users_service

import (
	"context"
	"errors"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user"
	"github.com/lssibb/Sweet-Garden-HITS/internal/utils"
)

func (s *UsersService) Login(ctx context.Context, email, password string) (domain.User, error) {
	user, err := s.usersRepository.GetUserByEmail(ctx, email)
	if err != nil {
		return domain.User{}, errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return domain.User{}, errors.New("invalid credentials")
	}

	return user, nil
}
