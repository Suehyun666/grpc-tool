package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"grpc-tool/internal/service"

	"github.com/labstack/echo/v4"
)

type ProtoHandler struct {
	Service *service.ProtoParserService
}

func (h *ProtoHandler) Upload(c echo.Context) error {
	// Source
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "file is required"})
	}

	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	defer src.Close()

	// Destination
	uploadDir := "tmp/protos"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to create upload directory"})
	}

	// Unique filename to avoid collisions
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	dstPath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to save file"})
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to copy file content"})
	}

	// Parse
	// TODO: Handle imports - for now assume no external imports or standard ones
	services, err := h.Service.ParseProto(dstPath, []string{uploadDir})
	if err != nil {
		os.Remove(dstPath)
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"file":     filename,
		"path":     dstPath,
		"services": services,
	})
}

func (h *ProtoHandler) ListServices(c echo.Context) error {
	path := c.QueryParam("path")
	if path == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "path is required"})
	}

	// We assume imports are relative to the file or standard
	services, err := h.Service.ParseProto(path, []string{})
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	serviceNames := make([]string, 0, len(services))
	for _, s := range services {
		serviceNames = append(serviceNames, s.Name)
	}

	return c.JSON(http.StatusOK, serviceNames)
}

func (h *ProtoHandler) GetService(c echo.Context) error {
	path := c.QueryParam("path")
	serviceName := c.QueryParam("service")
	if path == "" || serviceName == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "path and service are required"})
	}

	services, err := h.Service.ParseProto(path, []string{})
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	for _, s := range services {
		if s.Name == serviceName {
			return c.JSON(http.StatusOK, s)
		}
	}

	return c.JSON(http.StatusNotFound, echo.Map{"error": "service not found"})
}
