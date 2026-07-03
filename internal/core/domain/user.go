package core_domain_user

import "time"

type User struct {
	ID          int         
	Username    string      
	CreatedAt   time.Time
	UpdateAt    time.Time 
	CountPlants int          
}

func NewUser(
	id int,
	username string,
	cntPlants int,
) User {
	return User {
		ID: id,
		Username: username,
		CreatedAt: time.Now(),
		UpdateAt: time.Now(),
		CountPlants: 0,
	}
}

