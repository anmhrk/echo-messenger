package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

func RequireAuth() fiber.Handler {
    return func(c *fiber.Ctx) error {
        auth := c.Get("Authorization")
        if !strings.HasPrefix(strings.ToLower(auth), "bearer ") {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing bearer token"})
        }
        tokenString := strings.TrimSpace(auth[len("Bearer "):])
        claims, err := VerifyToken(tokenString)
        if err != nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
        }
        c.Locals("id", claims.Id)
        c.Locals("username", claims.Username)
        c.Locals("claims", claims)
        return c.Next()
    }
}

func CurrentUserId(c *fiber.Ctx) string {
    if v := c.Locals("id"); v != nil {
        if s, ok := v.(string); ok {
            return s
        }
    }
    return ""
}