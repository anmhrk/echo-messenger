package auth

import "sync"

type User struct {
    Id           string `json:"id"`
    Username     string `json:"username"`
    PasswordHash string `json:"-"`
}

var (
    usersMu sync.RWMutex
    users   = make(map[string]User)
)