package db

import "time"

type User struct {
	ID           int64     `bun:",pk,autoincrement"`
	Username     string    `bun:",notnull,unique"`
	PasswordHash string    `bun:",notnull"`
	CreatedAt    time.Time `bun:",nullzero,notnull,default:current_timestamp"`
}
