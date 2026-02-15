package store

import (
	"grpc-tool/internal/model"

	"gorm.io/gorm"
)

type ProjectStore struct {
	DB *gorm.DB
}

func (s *ProjectStore) Create(p *model.Project) error {
	return s.DB.Create(p).Error
}

func (s *ProjectStore) List() ([]model.Project, error) {
	var projects []model.Project
	err := s.DB.Order("created_at DESC").Find(&projects).Error
	return projects, err
}

func (s *ProjectStore) GetByID(id uint) (*model.Project, error) {
	var p model.Project
	err := s.DB.First(&p, id).Error
	return &p, err
}

func (s *ProjectStore) Update(p *model.Project) error {
	return s.DB.Save(p).Error
}

func (s *ProjectStore) Delete(id uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// Delete tests in folders belonging to this project
		if err := tx.Exec(
			"DELETE FROM tests WHERE folder_id IN (SELECT id FROM folders WHERE project_id = ?)", id,
		).Error; err != nil {
			return err
		}
		// Delete folders
		if err := tx.Where("project_id = ?", id).Delete(&model.Folder{}).Error; err != nil {
			return err
		}
		// Delete project
		return tx.Delete(&model.Project{}, id).Error
	})
}
