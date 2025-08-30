package db

import (
	"context"
	"database/sql"
	"os"

	"github.com/joho/godotenv"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	"github.com/uptrace/bun/extra/bundebug"
)

var db *bun.DB

func InitDB() {
	ctx := context.Background()
	godotenv.Load()

	// Open a PostgreSQL database
	dsn := os.Getenv("DATABASE_URL")
	pgdb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	// Create a Bun db on top of it
	db = bun.NewDB(pgdb, pgdialect.New())

	db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))

	// TODO: add db pooling connections

	// Create tables
	_, err := db.NewCreateTable().Model((*User)(nil)).IfNotExists().Exec(ctx)
	if err != nil {
		panic(err)
	}

	_, err = db.NewCreateTable().Model((*Chat)(nil)).IfNotExists().Exec(ctx)
	if err != nil {
		panic(err)
	}

	_, err = db.NewCreateTable().Model((*Message)(nil)).IfNotExists().Exec(ctx)
	if err != nil {
		panic(err)
	}

	_, err = db.NewCreateTable().Model((*ChatParticipant)(nil)).IfNotExists().Exec(ctx)
	if err != nil {
		panic(err)
	}

	if _, err := db.NewCreateIndex().Model((*User)(nil)).Index("users_username_uindex").Column("username").Unique().IfNotExists().Exec(ctx); err != nil {
		panic(err)
	}
}

func GetDB() *bun.DB {
	return db
}
