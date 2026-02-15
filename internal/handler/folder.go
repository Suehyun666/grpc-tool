package handler

import (
	"net/http"
	"strconv"

	"grpc-tool/internal/model"
	"grpc-tool/internal/store"

	"github.com/labstack/echo/v4"
)

type FolderHandler struct {
	Store *store.FolderStore
}

type createFolderRequest struct {
	Name string `json:"name"`
}

func (h *FolderHandler) Create(c echo.Context) error {
	projectID, err := strconv.ParseUint(c.Param("projectId"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid projectId"})
	}

	var req createFolderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "name is required"})
	}

	f := model.Folder{ProjectID: uint(projectID), Name: req.Name}
	if err := h.Store.Create(&f); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, f)
}

func (h *FolderHandler) List(c echo.Context) error {
	projectID, err := strconv.ParseUint(c.Param("projectId"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid projectId"})
	}

	folders, err := h.Store.ListByProject(uint(projectID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, folders)
}

func (h *FolderHandler) Update(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	f, err := h.Store.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "folder not found"})
	}

	var req createFolderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "name is required"})
	}

	f.Name = req.Name
	if err := h.Store.Update(f); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, f)
}

func (h *FolderHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	if _, err := h.Store.GetByID(uint(id)); err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "folder not found"})
	}

	if err := h.Store.Delete(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
