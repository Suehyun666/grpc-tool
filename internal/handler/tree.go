package handler

import (
	"net/http"
	"strconv"

	"grpc-tool/internal/store"

	"github.com/labstack/echo/v4"
)

type TreeHandler struct {
	ProjectStore *store.ProjectStore
	FolderStore  *store.FolderStore
	TestStore    *store.TestStore
}

type treeTest struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type treeFolder struct {
	ID    uint       `json:"id"`
	Name  string     `json:"name"`
	Tests []treeTest `json:"tests"`
}

type treeResponse struct {
	ID      uint         `json:"id"`
	Name    string       `json:"name"`
	Folders []treeFolder `json:"folders"`
}

func (h *TreeHandler) GetTree(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	project, err := h.ProjectStore.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "project not found"})
	}

	folders, err := h.FolderStore.ListByProject(project.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	tree := treeResponse{
		ID:      project.ID,
		Name:    project.Name,
		Folders: make([]treeFolder, 0, len(folders)),
	}

	for _, f := range folders {
		tests, err := h.TestStore.ListByFolder(f.ID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
		}

		tf := treeFolder{
			ID:    f.ID,
			Name:  f.Name,
			Tests: make([]treeTest, 0, len(tests)),
		}
		for _, t := range tests {
			tf.Tests = append(tf.Tests, treeTest{ID: t.ID, Name: t.Name})
		}
		tree.Folders = append(tree.Folders, tf)
	}

	return c.JSON(http.StatusOK, tree)
}
