package handler

import (
	"net/http"
	"strconv"

	"grpc-tool/internal/model"
	"grpc-tool/internal/store"

	"github.com/labstack/echo/v4"
)

type TestHandler struct {
	Store *store.TestStore
}

type createTestRequest struct {
	Name   string           `json:"name"`
	Config model.TestConfig `json:"config"`
}

func (h *TestHandler) Create(c echo.Context) error {
	folderID, err := strconv.ParseUint(c.Param("folderId"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid folderId"})
	}

	var req createTestRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "name is required"})
	}

	t := model.Test{FolderID: uint(folderID), Name: req.Name, Config: req.Config}
	if err := h.Store.Create(&t); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, t)
}

func (h *TestHandler) List(c echo.Context) error {
	folderID, err := strconv.ParseUint(c.Param("folderId"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid folderId"})
	}

	tests, err := h.Store.ListByFolder(uint(folderID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, tests)
}

func (h *TestHandler) Get(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	t, err := h.Store.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "test not found"})
	}
	return c.JSON(http.StatusOK, t)
}

func (h *TestHandler) Update(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	t, err := h.Store.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "test not found"})
	}

	var req createTestRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "name is required"})
	}

	t.Name = req.Name
	t.Config = req.Config
	if err := h.Store.Update(t); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, t)
}

func (h *TestHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	if _, err := h.Store.GetByID(uint(id)); err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "test not found"})
	}

	if err := h.Store.Delete(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
