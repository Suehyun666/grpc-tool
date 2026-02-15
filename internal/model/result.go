package model

import "time"

type TestResult struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TestID    uint      `json:"testId" gorm:"not null;index"`
	Report    string    `json:"report" gorm:"type:text"`
	Status    string    `json:"status" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
}
