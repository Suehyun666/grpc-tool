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
		// Clean up on error (optional)
		// os.Remove(dstPath)
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"file":     filename,
		"path":     dstPath,
		"services": services,
	})
}
