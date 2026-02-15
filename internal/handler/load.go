package handler

import (
	"context"
	"net/http"

	"grpc-tool/internal/model"
	"grpc-tool/internal/service"

	"github.com/labstack/echo/v4"
)

type LoadTestHandler struct {
	Service *service.LoadTesterService
}

func (h *LoadTestHandler) RunLoadTest(c echo.Context) error {
	var req model.TestConfig
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	// Basic validation
	if req.Service == "" || req.Method == "" || req.Host == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "missing required fields"})
	}

	report, err := h.Service.RunLoadTest(context.Background(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}
