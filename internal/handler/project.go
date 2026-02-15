package handler

import (
	"net/http"
	"strconv"

	"grpc-tool/internal/model"
	"grpc-tool/internal/store"

	"github.com/labstack/echo/v4"
)

type ProjectHandler struct {
	Store *store.ProjectStore
}

type createProjectRequest struct {
	Name string `json:"name"`
}

func (h *ProjectHandler) Create(c echo.Context) error {
	var req createProjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "name is required"})
	}

	p := model.Project{Name: req.Name}
	if err := h.Store.Create(&p); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, p)
}

func (h *ProjectHandler) List(c echo.Context) error {
	projects, err := h.Store.List()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) Get(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	p, err := h.Store.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "project not found"})
	}
	return c.JSON(http.StatusOK, p)
}

func (h *ProjectHandler) Update(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	p, err := h.Store.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "project not found"})
	}

	var req createProjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "name is required"})
	}

	p.Name = req.Name
	if err := h.Store.Update(p); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, p)
}

func (h *ProjectHandler) Delete(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	if _, err := h.Store.GetByID(uint(id)); err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "project not found"})
	}

	if err := h.Store.Delete(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}
