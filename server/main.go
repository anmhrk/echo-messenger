package main

import (
	"log"
	"os"

	"github.com/anmhrk/echo/server/auth"
	"github.com/anmhrk/echo/server/db"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	db.InitDB()

	app := fiber.New()

	app.Use(healthcheck.New())
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins: os.Getenv("FRONTEND_URL"),
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Auth routes
	auth.RegisterAuthRoutes(app)

	log.Fatal(app.Listen(":3001"))
}
