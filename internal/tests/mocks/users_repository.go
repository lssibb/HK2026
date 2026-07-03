package mocks

import (
	"context"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user"
	"github.com/stretchr/testify/mock"
)

type MockUsersRepository struct {
	mock.Mock
}

func (m *MockUsersRepository) CreateUser(ctx context.Context, user domain.User) (domain.User, error) {
	args := m.Called(ctx, user)
	return args.Get(0).(domain.User), args.Error(1)
}

func (m *MockUsersRepository) GetUserByUsername(ctx context.Context, username string) (domain.User, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(domain.User), args.Error(1)
}

func (m *MockUsersRepository) GetUserByEmail(ctx context.Context, email string) (domain.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(domain.User), args.Error(1)
}
