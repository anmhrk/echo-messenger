package main

import (
	"log"

	auth "github.com/anmhrk/echo/server/auth"
	"github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()

    app.Get("/health", func(c *fiber.Ctx) error {
        return c.SendString("OK")
    })

    // Auth routes
    auth.RegisterAuthRoutes(app)

    log.Fatal(app.Listen(":3001"))
}
