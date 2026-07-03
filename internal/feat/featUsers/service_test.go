package users_service_test

import (
	"context"
	"errors"
	"testing"

	domain "github.com/lssibb/Sweet-Garden-HITS/internal/core/domain/user"
	users_service "github.com/lssibb/Sweet-Garden-HITS/internal/feat/featUsers"
	"github.com/lssibb/Sweet-Garden-HITS/internal/tests/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCreateUser(t *testing.T) {
	mockRepo := new(mocks.MockUsersRepository)
	service := users_service.NewUsersService(mockRepo)

	ctx := context.Background()

	t.Run("successful creation", func(t *testing.T) {
		user := domain.User{
			Username:     "testuser",
			Email:        "test@test.com",
			PasswordHash: "password123",
		}

		mockRepo.On("CreateUser", ctx, mock.AnythingOfType("user.User")).Return(domain.User{ID: 1, Username: "testuser", Email: "test@test.com"}, nil).Once()

		createdUser, err := service.CreateUser(ctx, user)

		assert.NoError(t, err)
		assert.Equal(t, int64(1), createdUser.ID)
		assert.Equal(t, "testuser", createdUser.Username)
		mockRepo.AssertExpectations(t)
	})

	t.Run("validation failed", func(t *testing.T) {
		user := domain.User{
			Username: "", // Invalid, should fail validation
		}

		_, err := service.CreateUser(ctx, user)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Validate user domain")
	})
}

func TestLogin(t *testing.T) {
	mockRepo := new(mocks.MockUsersRepository)
	service := users_service.NewUsersService(mockRepo)
	ctx := context.Background()

	t.Run("user not found", func(t *testing.T) {
		mockRepo.On("GetUserByEmail", ctx, "notfound@test.com").Return(domain.User{}, errors.New("user not found")).Once()

		_, err := service.Login(ctx, "notfound@test.com", "password")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid credentials")
		mockRepo.AssertExpectations(t)
	})
}
