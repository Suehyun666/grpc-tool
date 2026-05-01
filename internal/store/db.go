package store

import (
	"os"
	"path/filepath"

	"grpc-tool/internal/model"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func InitDB(dbPath string) (*gorm.DB, error) {
	if dir := filepath.Dir(dbPath); dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, err
		}
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
    if err != nil {
        return nil, err
    }

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