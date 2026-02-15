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

	// Load Testing Params
	LoadSchedule       string `json:"loadSchedule"`       // "constant", "step", "linear"
	RPS                int    `json:"rps"`                // for constant
	TotalRequests      int    `json:"totalRequests"`      // -n
	Duration           string `json:"duration"`           // -z
	Concurrency        int    `json:"concurrency"`        // -c
	ConcurrentSchedule string `json:"concurrentSchedule"` // "constant", "step", "linear"
	Step               int    `json:"step"`               // step load
	StepDuration       string `json:"stepDuration"`       // step duration
	MaxDuration        string `json:"maxDuration"`        // max duration
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
