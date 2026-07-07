package services

import (
	"fmt"
	"sort"

	"github.com/nullisokz/leakwatch/internal/models"
)

func BuildSummary(transactions []models.Transaction, subs []models.Subscription) *models.Summary {
	if len(transactions) == 0 {
		return &models.Summary{}
	}

	var total float64
	monthMap := make(map[string]float64)
	catMap := make(map[string]float64)
	catCount := make(map[string]int)

	for _, tx := range transactions {
		total += tx.Amount
		key := fmt.Sprintf("%d-%02d", tx.Date.Year(), tx.Date.Month())
		monthMap[key] += tx.Amount
		catMap[tx.Category] += tx.Amount
		catCount[tx.Category]++
	}

	// Monthly totals sorted chronologically
	var monthlyTotals []models.MonthlyTotal
	for m, amt := range monthMap {
		monthlyTotals = append(monthlyTotals, models.MonthlyTotal{Month: m, Amount: round2(amt)})
	}
	sort.Slice(monthlyTotals, func(i, j int) bool {
		return monthlyTotals[i].Month < monthlyTotals[j].Month
	})

	// Category totals sorted by amount desc
	var catTotals []models.CategoryTotal
	topCat := ""
	topAmt := 0.0
	for cat, amt := range catMap {
		catTotals = append(catTotals, models.CategoryTotal{
			Category: cat,
			Amount:   round2(amt),
			Count:    catCount[cat],
		})
		if amt > topAmt {
			topAmt = amt
			topCat = cat
		}
	}
	sort.Slice(catTotals, func(i, j int) bool {
		return catTotals[i].Amount > catTotals[j].Amount
	})

	var subTotal float64
	for _, s := range subs {
		switch s.Frequency {
		case models.FrequencyMonthly:
			subTotal += s.Amount
		case models.FrequencyYearly:
			subTotal += s.Amount / 12
		case models.FrequencyWeekly:
			subTotal += s.Amount * 4
		}
	}

	avgMonthly := 0.0
	if len(monthMap) > 0 {
		avgMonthly = total / float64(len(monthMap))
	}

	return &models.Summary{
		TotalSpent:        round2(total),
		AverageMonthly:    round2(avgMonthly),
		TransactionCount:  len(transactions),
		MonthlyTotals:     monthlyTotals,
		CategoryTotals:    catTotals,
		TopCategory:       topCat,
		SubscriptionTotal: round2(subTotal),
	}
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
