package model

import "time"

type Folder struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProjectID uint      `json:"projectId" gorm:"not null;index"`
	Name      string    `json:"name" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Tests     []Test    `json:"tests,omitempty" gorm:"foreignKey:FolderID;constraint:OnDelete:CASCADE"`
}
