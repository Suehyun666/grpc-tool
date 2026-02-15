package main

import (
	"log"

	"grpc-tool/internal/server"
	"grpc-tool/internal/store"
)

func main() {
	db, err := store.InitDB("data/grpc-tool.db")
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	e := server.New(db)
	e.Logger.Fatal(e.Start(":52274"))
}
