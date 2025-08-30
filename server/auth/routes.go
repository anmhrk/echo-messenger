package auth

import (
	"context"
	"database/sql"
	"strings"

	appdb "github.com/anmhrk/echo/server/db"
	"github.com/gofiber/fiber/v2"
)

func RegisterAuthRoutes(app *fiber.App) {
	g := app.Group("/auth")

	g.Post("/register", func(c *fiber.Ctx) error {
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

		ctx := context.Background()
		db := appdb.GetDB()

		// Check if username already exists
		var user appdb.User
		err := db.NewSelect().Model(&user).Where("username = ?", body.Username).Limit(1).Scan(ctx)
		if err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "username already exists"})
		}
		if err != sql.ErrNoRows {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to query users"})
		}

		// Hash password
		hash, err := HashPassword(body.Password)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to hash password"})
		}

		u := appdb.User{Username: body.Username, PasswordHash: hash}
		if _, err := db.NewInsert().Model(&u).Exec(ctx); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create user"})
		}

		token, err := GenerateToken(u.Username)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
		}
		return c.JSON(fiber.Map{
			"token": token,
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
		ctx := context.Background()
		db := appdb.GetDB()

		var u appdb.User
		if err := db.NewSelect().Model(&u).Where("username = ?", body.Username).Limit(1).Scan(ctx); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
		}

		// Compare hashed password with plain password
		if err := CheckPasswordHash(body.Password, u.PasswordHash); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
		}

		token, err := GenerateToken(u.Username)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
		}
		return c.JSON(fiber.Map{
			"token": token,
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
