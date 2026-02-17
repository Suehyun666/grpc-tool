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

	// Load Test Basic
	RPS           int    `json:"rps"`
	TotalRequests int    `json:"totalRequests"`
	Duration      string `json:"duration"`
	Concurrency   int    `json:"concurrency"`

	// Load Schedule
	LoadSchedule     string `json:"loadSchedule"` // "const", "step", "line"
	LoadStart        int    `json:"loadStart"`
	LoadEnd          int    `json:"loadEnd"`
	LoadStep         int    `json:"loadStep"`
	LoadStepDuration string `json:"loadStepDuration"`

	// Advanced
	Connections             int    `json:"connections"`
	DialTimeout             int    `json:"dialTimeout"`
	CPUs                    int    `json:"cpus"`
	ConcurrencySchedule     string `json:"concurrencySchedule"`
	ConcurrencyStart        int    `json:"concurrencyStart"`
	ConcurrencyEnd          int    `json:"concurrencyEnd"`
	ConcurrencyStep         int    `json:"concurrencyStep"`
	ConcurrencyStepDuration string `json:"concurrencyStepDuration"`
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
