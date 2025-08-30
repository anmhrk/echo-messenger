package main

import (
	"log"
	"os"

	"github.com/anmhrk/echo/server/auth"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/joho/godotenv"
)

func main() {
    godotenv.Load()
    
    app := fiber.New()

    app.Use(healthcheck.New())

    app.Use(cors.New(cors.Config{
        AllowOrigins: os.Getenv("FRONTEND_URL"),
        AllowHeaders: "Origin, Content-Type, Accept",
    }))

    // Auth routes
    auth.RegisterAuthRoutes(app)

    log.Fatal(app.Listen(":3001"))
}