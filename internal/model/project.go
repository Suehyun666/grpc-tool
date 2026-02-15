package model

import "time"

type Project struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Folders   []Folder  `json:"folders,omitempty" gorm:"foreignKey:ProjectID;constraint:OnDelete:CASCADE"`
}
