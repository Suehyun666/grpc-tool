package store

import (
	"grpc-tool/internal/model"

	"gorm.io/gorm"
)

type FolderStore struct {
	DB *gorm.DB
}

func (s *FolderStore) Create(f *model.Folder) error {
	return s.DB.Create(f).Error
}

func (s *FolderStore) ListByProject(projectID uint) ([]model.Folder, error) {
	var folders []model.Folder
	err := s.DB.Where("project_id = ?", projectID).Order("created_at ASC").Find(&folders).Error
	return folders, err
}

func (s *FolderStore) GetByID(id uint) (*model.Folder, error) {
	var f model.Folder
	err := s.DB.First(&f, id).Error
	return &f, err
}

func (s *FolderStore) Update(f *model.Folder) error {
	return s.DB.Save(f).Error
}

func (s *FolderStore) Delete(id uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		// Delete tests in this folder
		if err := tx.Where("folder_id = ?", id).Delete(&model.Test{}).Error; err != nil {
			return err
		}
		// Delete folder
		return tx.Delete(&model.Folder{}, id).Error
	})
}
