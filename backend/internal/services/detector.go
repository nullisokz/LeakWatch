package services

import (
	"math"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/nullisokz/leakwatch/internal/models"
)

// DetectSubscriptions identifies recurring charges from a transaction list.
// It groups transactions by normalized merchant name and looks for consistent
// intervals (weekly ≈7d, monthly ≈30d, yearly ≈365d) with similar amounts.
func DetectSubscriptions(transactions []models.Transaction) []models.Subscription {
	groups := groupByMerchant(transactions)

	var subs []models.Subscription
	for name, txs := range groups {
		if len(txs) < 2 {
			continue
		}
		sort.Slice(txs, func(i, j int) bool { return txs[i].Date.Before(txs[j].Date) })

		freq, ok := detectFrequency(txs)
		if !ok {
			continue
		}

		last := txs[len(txs)-1]
		avg := averageAmount(txs)

		subs = append(subs, models.Subscription{
			ID:          uuid.New().String(),
			Name:        name,
			Amount:      math.Round(avg*100) / 100,
			Frequency:   freq,
			LastCharged: last.Date,
			NextRenewal: nextRenewal(last.Date, freq),
			Category:    last.Category,
			Occurrences: len(txs),
		})
	}

	sort.Slice(subs, func(i, j int) bool { return subs[i].Amount > subs[j].Amount })
	return subs
}

func groupByMerchant(txs []models.Transaction) map[string][]models.Transaction {
	groups := make(map[string][]models.Transaction)
	for _, tx := range txs {
		key := normalizeMerchant(tx.Description)
		groups[key] = append(groups[key], tx)
	}
	return groups
}

// normalizeMerchant strips noise tokens (dates, IDs, digits) to produce a
// stable merchant key, e.g. "NETFLIX.COM 123456" → "netflix".
func normalizeMerchant(desc string) string {
	lower := strings.ToLower(desc)
	// Take first 2 words as the key to handle "Netflix.com 12345" → "netflix"
	words := strings.Fields(lower)
	var clean []string
	for _, w := range words {
		// skip pure-numeric tokens
		allDigit := true
		for _, c := range w {
			if c < '0' || c > '9' {
				allDigit = false
				break
			}
		}
		if allDigit {
			continue
		}
		// strip punctuation
		w = strings.Trim(w, ".,/#*-_")
		if w != "" {
			clean = append(clean, w)
		}
		if len(clean) == 2 {
			break
		}
	}
	if len(clean) == 0 {
		return lower
	}
	return strings.Join(clean, " ")
}

func detectFrequency(txs []models.Transaction) (models.Frequency, bool) {
	if len(txs) < 2 {
		return "", false
	}
	var gaps []float64
	for i := 1; i < len(txs); i++ {
		days := txs[i].Date.Sub(txs[i-1].Date).Hours() / 24
		gaps = append(gaps, days)
	}
	avg := mean(gaps)

	// Check if amounts are similar (within 20%)
	if !amountsSimilar(txs) {
		return "", false
	}

	switch {
	case avg >= 5 && avg <= 10:
		return models.FrequencyWeekly, true
	case avg >= 20 && avg <= 45:
		return models.FrequencyMonthly, true
	case avg >= 300 && avg <= 400:
		return models.FrequencyYearly, true
	}
	return "", false
}

func amountsSimilar(txs []models.Transaction) bool {
	if len(txs) == 0 {
		return false
	}
	avg := averageAmount(txs)
	if avg == 0 {
		return false
	}
	for _, tx := range txs {
		if math.Abs(tx.Amount-avg)/avg > 0.25 {
			return false
		}
	}
	return true
}

func averageAmount(txs []models.Transaction) float64 {
	var sum float64
	for _, tx := range txs {
		sum += tx.Amount
	}
	return sum / float64(len(txs))
}

func mean(vals []float64) float64 {
	if len(vals) == 0 {
		return 0
	}
	var sum float64
	for _, v := range vals {
		sum += v
	}
	return sum / float64(len(vals))
}

func nextRenewal(last time.Time, freq models.Frequency) time.Time {
	now := time.Now()
	switch freq {
	case models.FrequencyWeekly:
		next := last.AddDate(0, 0, 7)
		for next.Before(now) {
			next = next.AddDate(0, 0, 7)
		}
		return next
	case models.FrequencyMonthly:
		next := last.AddDate(0, 1, 0)
		for next.Before(now) {
			next = next.AddDate(0, 1, 0)
		}
		return next
	case models.FrequencyYearly:
		next := last.AddDate(1, 0, 0)
		for next.Before(now) {
			next = next.AddDate(1, 0, 0)
		}
		return next
	}
	return last
}
