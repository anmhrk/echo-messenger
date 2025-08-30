package auth

import (
	"errors"
	"os"
	"sync"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

var (
	jwtSecret     []byte
	jwtSecretOnce sync.Once
)

func loadJWTSecret() []byte {
	jwtSecretOnce.Do(func() {
		_ = godotenv.Load()
		secret := os.Getenv("JWT_SECRET")
		jwtSecret = []byte(secret)
	})
	return jwtSecret
}

func HashPassword(plain string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), 12)
	return string(hash), err
}

func CheckPasswordHash(plain, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
}

type AuthClaims struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(username string) (string, error) {
	claims := AuthClaims{
		Id:       uuid.New().String(),
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(loadJWTSecret())
}

func VerifyToken(tokenString string) (*AuthClaims, error) {
	if tokenString == "" {
		return nil, errors.New("missing token")
	}

	var claims AuthClaims
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (any, error) {
		// enforce HS256
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return loadJWTSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return &claims, nil
}
