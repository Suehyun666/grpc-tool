package store

import (
	"grpc-tool/internal/model"

	"gorm.io/gorm"
)

type TestStore struct {
	DB *gorm.DB
}

func (s *TestStore) Create(t *model.Test) error {
	return s.DB.Create(t).Error
}

func (s *TestStore) ListByFolder(folderID uint) ([]model.Test, error) {
	var tests []model.Test
	err := s.DB.Where("folder_id = ?", folderID).Order("created_at ASC").Find(&tests).Error
	return tests, err
}

func (s *TestStore) GetByID(id uint) (*model.Test, error) {
	var t model.Test
	err := s.DB.First(&t, id).Error
	return &t, err
}

func (s *TestStore) Update(t *model.Test) error {
	return s.DB.Save(t).Error
}

func (s *TestStore) Delete(id uint) error {
	return s.DB.Delete(&model.Test{}, id).Error
}
