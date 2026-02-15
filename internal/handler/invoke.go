package handler

import (
	"context"
	"fmt"
	"net/http"

	"grpc-tool/internal/service"

	"github.com/labstack/echo/v4"
)

type InvokeHandler struct {
	Service *service.InvokerService
}

func (h *InvokeHandler) Invoke(c echo.Context) error {
	var req service.InvocationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	if req.ProtoPath == "" || req.ServiceName == "" || req.MethodName == "" || req.Host == "" {
		fmt.Printf("Invalid Request: %+v\n", req)
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "missing required fields"})
	}
	fmt.Printf("Invoke Request: %+v\n", req)

	resp, err := h.Service.Invoke(context.Background(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}
