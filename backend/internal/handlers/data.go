package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/nullisokz/leakwatch/internal/models"
	"github.com/nullisokz/leakwatch/internal/store"
)

type DataHandler struct {
	store *store.Store
}

func NewDataHandler(s *store.Store) *DataHandler {
	return &DataHandler{store: s}
}

func (h *DataHandler) Summary(w http.ResponseWriter, r *http.Request) {
	sess, ok := h.getSession(w, r)
	if !ok {
		return
	}
	jsonOK(w, sess.Summary)
}

func (h *DataHandler) Subscriptions(w http.ResponseWriter, r *http.Request) {
	sess, ok := h.getSession(w, r)
	if !ok {
		return
	}
	jsonOK(w, sess.Subscriptions)
}

func (h *DataHandler) Transactions(w http.ResponseWriter, r *http.Request) {
	sess, ok := h.getSession(w, r)
	if !ok {
		return
	}

	txs := sess.Transactions

	// Optional query filters
	q := r.URL.Query()
	if cat := q.Get("category"); cat != "" {
		var filtered []models.Transaction
		for _, tx := range txs {
			if tx.Category == cat {
				filtered = append(filtered, tx)
			}
		}
		txs = filtered
	}

	// Pagination
	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 {
		page = 1
	}
	pageSize := 50
	total := len(txs)
	start := (page - 1) * pageSize
	if start >= total {
		txs = nil
	} else {
		end := start + pageSize
		if end > total {
			end = total
		}
		txs = txs[start:end]
	}

	jsonOK(w, map[string]any{
		"transactions": txs,
		"total":        total,
		"page":         page,
		"page_size":    pageSize,
	})
}

func (h *DataHandler) getSession(w http.ResponseWriter, r *http.Request) (*store.Session, bool) {
	id := chi.URLParam(r, "sessionID")
	sess, ok := h.store.Get(id)
	if !ok {
		jsonError(w, "session not found or expired", http.StatusNotFound)
		return nil, false
	}
	return sess, true
}

func jsonOK(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
