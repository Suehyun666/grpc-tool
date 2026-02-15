package server

import (
	"net/http"

	"grpc-tool/internal/handler"
	"grpc-tool/internal/store"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/gorm"
)

func New(db *gorm.DB) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}))

	// Stores
	projectStore := &store.ProjectStore{DB: db}
	folderStore := &store.FolderStore{DB: db}
	testStore := &store.TestStore{DB: db}

	// Handlers
	ph := &handler.ProjectHandler{Store: projectStore}
	fh := &handler.FolderHandler{Store: folderStore}
	th := &handler.TestHandler{Store: testStore}
	trh := &handler.TreeHandler{
		ProjectStore: projectStore,
		FolderStore:  folderStore,
		TestStore:    testStore,
	}

	// Routes
	api := e.Group("/api")

	// Health
	api.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{"status": "ok"})
	})

	// Projects
	api.POST("/projects", ph.Create)
	api.GET("/projects", ph.List)
	api.GET("/projects/:id", ph.Get)
	api.PUT("/projects/:id", ph.Update)
	api.DELETE("/projects/:id", ph.Delete)

	// Folders
	api.POST("/projects/:projectId/folders", fh.Create)
	api.GET("/projects/:projectId/folders", fh.List)
	api.PUT("/folders/:id", fh.Update)
	api.DELETE("/folders/:id", fh.Delete)

	// Tests
	api.POST("/folders/:folderId/tests", th.Create)
	api.GET("/folders/:folderId/tests", th.List)
	api.GET("/tests/:id", th.Get)
	api.PUT("/tests/:id", th.Update)
	api.DELETE("/tests/:id", th.Delete)

	// Tree
	api.GET("/projects/:id/tree", trh.GetTree)

	return e
}
