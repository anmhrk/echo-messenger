package db

import "time"

type User struct {
	ID           int64     `bun:",pk,autoincrement"`
	Username     string    `bun:",notnull,unique"`
	PasswordHash string    `bun:",notnull"`
	CreatedAt    time.Time `bun:",nullzero,notnull,default:current_timestamp"`
}

type Chat struct {
	ID        int64     `bun:",pk,autoincrement"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp"`
}

type ChatParticipant struct {
	JoinedAt time.Time `bun:",nullzero,notnull,default:current_timestamp"`
	ChatID   int64     `bun:",pk,notnull"`
	Chat     *Chat     `bun:"rel:belongs-to,join:chat_id=id"`
	UserID   int64     `bun:",pk,notnull"`
	User     *User     `bun:"rel:belongs-to,join:user_id=id"`
}

type Message struct {
	ID       int64     `bun:",pk,autoincrement"`
	SentAt   time.Time `bun:",nullzero,notnull,default:current_timestamp"`
	ChatID   int64     `bun:",notnull"`
	Chat     *Chat     `bun:"rel:belongs-to,join:chat_id=id"`
	SenderID int64     `bun:",notnull"`
	Sender   *User     `bun:"rel:belongs-to,join:sender_id=id"`
	Content  string    `bun:",notnull"`
}
