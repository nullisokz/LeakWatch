package models

import "time"

type Transaction struct {
	ID          string    `json:"id"`
	Date        time.Time `json:"date"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Category    string    `json:"category"`
	Currency    string    `json:"currency"`
}

type MonthlyTotal struct {
	Month  string  `json:"month"` // "2024-01"
	Amount float64 `json:"amount"`
}

type CategoryTotal struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Count    int     `json:"count"`
}

type Summary struct {
	TotalSpent        float64         `json:"total_spent"`
	AverageMonthly    float64         `json:"average_monthly"`
	TransactionCount  int             `json:"transaction_count"`
	MonthlyTotals     []MonthlyTotal  `json:"monthly_totals"`
	CategoryTotals    []CategoryTotal `json:"category_totals"`
	TopCategory       string          `json:"top_category"`
	SubscriptionTotal float64         `json:"subscription_total"`
}
