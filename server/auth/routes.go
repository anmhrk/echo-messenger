package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
    g := app.Group("/auth")

    g.Post("/signup", func(c *fiber.Ctx) error {
        var body struct {
            Username string `json:"username"`
            Password string `json:"password"`
        }
        if err := c.BodyParser(&body); err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
        }
        if body.Username == "" || body.Password == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "username and password required"})
        }

        usersMu.Lock()
        defer usersMu.Unlock()
        if _, exists := users[body.Username]; exists {
            return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "username already exists"})
        }

        hash, err := HashPassword(body.Password)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to hash password"})
        }

        u := User{Username: body.Username, PasswordHash: hash}
        users[u.Username] = u

        return c.Status(fiber.StatusCreated).JSON(fiber.Map{
            "user": fiber.Map{"username": u.Username},
        })
    })

    g.Post("/login", func(c *fiber.Ctx) error {
        var body struct {
            Username string `json:"username"`
            Password string `json:"password"`
        }
        if err := c.BodyParser(&body); err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
        }
        usersMu.RLock()
        u, ok := users[body.Username]
        usersMu.RUnlock()
        if !ok {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
        }
        if err := CheckPasswordHash(body.Password, u.PasswordHash); err != nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
        }

        token, err := GenerateToken(u.Username)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
        }
        return c.JSON(fiber.Map{
            "token": token,
            "user":  fiber.Map{"username": u.Username},
        })
    })

    g.Get("/token", func(c *fiber.Ctx) error {
        auth := c.Get("Authorization")
        if !strings.HasPrefix(strings.ToLower(auth), "bearer ") {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing bearer token"})
        }
        tokenString := strings.TrimSpace(auth[len("Bearer "):])
        claims, err := VerifyToken(tokenString)
        if err != nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
        }
        return c.JSON(fiber.Map{
            "valid":    true,
            "username": claims.Username,
            "exp":      claims.ExpiresAt,
        })
    })
}