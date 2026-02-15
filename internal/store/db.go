package store

import (
	"grpc-tool/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Enable foreign keys for SQLite
	db.Exec("PRAGMA foreign_keys = ON")

	err = db.AutoMigrate(
		&model.Project{},
		&model.Folder{},
		&model.Test{},
		&model.TestResult{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
