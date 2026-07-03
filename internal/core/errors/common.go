package core_errors

import "errors"

var (
	ErrNotFound        = errors.New("not found")
	errInvalidArgument = errors.New("invalid argument")
	errConflict        = errors.New("conflict")
)
