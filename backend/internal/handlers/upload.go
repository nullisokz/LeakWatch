package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/nullisokz/leakwatch/internal/services"
	"github.com/nullisokz/leakwatch/internal/store"
)

type UploadHandler struct {
	store *store.Store
	cat   *services.Categorizer
}

func NewUploadHandler(s *store.Store, cat *services.Categorizer) *UploadHandler {
	return &UploadHandler{store: s, cat: cat}
}

func (h *UploadHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		jsonError(w, "request too large", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		jsonError(w, "missing file field", http.StatusBadRequest)
		return
	}
	defer file.Close()

	transactions, err := services.ParseCSV(file, h.cat)
	if err != nil {
		jsonError(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	if len(transactions) == 0 {
		jsonError(w, "no valid transactions found in CSV", http.StatusUnprocessableEntity)
		return
	}

	subs := services.DetectSubscriptions(transactions)
	summary := services.BuildSummary(transactions, subs)

	sessionID := uuid.New().String()
	h.store.Save(sessionID, &store.Session{
		Transactions:  transactions,
		Subscriptions: subs,
		Summary:       summary,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"session_id":   sessionID,
		"transactions": len(transactions),
	})
}
