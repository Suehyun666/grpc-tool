package handler

import (
	"net/http"

	"grpc-tool/internal/model"
	"grpc-tool/internal/service"

	"github.com/labstack/echo/v4"
)

type InvokeHandler struct {
	Service *service.InvokeService
}

func (h *InvokeHandler) Invoke(c echo.Context) error {
	var req model.TestConfig
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	if req.Service == "" || req.Method == "" || req.Host == "" || req.ProtoPath == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "missing required fields"})
	}

	result, err := h.Service.Invoke(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}
