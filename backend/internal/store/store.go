package store

import (
	"sync"
	"time"

	"github.com/nullisokz/leakwatch/internal/models"
)

type Session struct {
	Transactions  []models.Transaction
	Subscriptions []models.Subscription
	Summary       *models.Summary
	CreatedAt     time.Time
}

type Store struct {
	mu       sync.RWMutex
	sessions map[string]*Session
}

func New() *Store {
	s := &Store{sessions: make(map[string]*Session)}
	go s.cleanup()
	return s
}

func (s *Store) Save(sessionID string, sess *Session) {
	s.mu.Lock()
	defer s.mu.Unlock()
	sess.CreatedAt = time.Now()
	s.sessions[sessionID] = sess
}

func (s *Store) Get(sessionID string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sess, ok := s.sessions[sessionID]
	return sess, ok
}

// cleanup removes sessions older than 1 hour to prevent memory leaks.
func (s *Store) cleanup() {
	ticker := time.NewTicker(10 * time.Minute)
	for range ticker.C {
		s.mu.Lock()
		for id, sess := range s.sessions {
			if time.Since(sess.CreatedAt) > time.Hour {
				delete(s.sessions, id)
			}
		}
		s.mu.Unlock()
	}
}
