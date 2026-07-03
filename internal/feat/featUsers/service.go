package users_service

type UsersService struct {
	usersRepository UsersRepository
}

func NewUsersService(usersRepository UsersRepository) *UsersService {
	return &UsersService{
		usersRepository: usersRepository,
	}
}
