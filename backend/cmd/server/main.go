package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/nullisokz/leakwatch/internal/handlers"
	"github.com/nullisokz/leakwatch/internal/services"
	"github.com/nullisokz/leakwatch/internal/store"
	"github.com/rs/cors"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	s := store.New()
	cat := services.NewCategorizer()

	uploadHandler := handlers.NewUploadHandler(s, cat)
	dataHandler := handlers.NewDataHandler(s)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	r.Post("/api/upload", uploadHandler.ServeHTTP)

	r.Route("/api/sessions/{sessionID}", func(r chi.Router) {
		r.Get("/summary", dataHandler.Summary)
		r.Get("/subscriptions", dataHandler.Subscriptions)
		r.Get("/transactions", dataHandler.Transactions)
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: false,
	})

	log.Printf("LeakWatch API listening on :%s", port)
	if err := http.ListenAndServe(":"+port, c.Handler(r)); err != nil {
		log.Fatal(err)
	}
}
