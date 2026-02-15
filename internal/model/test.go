package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type TestConfig struct {
	Host      string            `json:"host"`
	Service   string            `json:"service"`
	Method    string            `json:"method"`
	ProtoPath string            `json:"protoPath"`
	Data      string            `json:"data"`
	Metadata  map[string]string `json:"metadata"`
	Insecure  bool              `json:"insecure"`
	Timeout   int               `json:"timeout"`
}

// Value implements driver.Valuer for GORM JSON serialization.
func (c TestConfig) Value() (driver.Value, error) {
	return json.Marshal(c)
}

// Scan implements sql.Scanner for GORM JSON deserialization.
func (c *TestConfig) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		str, ok := value.(string)
		if !ok {
			return errors.New("TestConfig: unsupported scan type")
		}
		bytes = []byte(str)
	}
	return json.Unmarshal(bytes, c)
}

type Test struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	FolderID  uint       `json:"folderId" gorm:"not null;index"`
	Name      string     `json:"name" gorm:"not null"`
	Config    TestConfig `json:"config" gorm:"type:text"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}
