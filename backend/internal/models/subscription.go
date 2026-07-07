package models

import "time"

type Frequency string

const (
	FrequencyWeekly  Frequency = "weekly"
	FrequencyMonthly Frequency = "monthly"
	FrequencyYearly  Frequency = "yearly"
)

type Subscription struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Amount      float64   `json:"amount"`
	Frequency   Frequency `json:"frequency"`
	NextRenewal time.Time `json:"next_renewal"`
	LastCharged time.Time `json:"last_charged"`
	Category    string    `json:"category"`
	Occurrences int       `json:"occurrences"`
}
