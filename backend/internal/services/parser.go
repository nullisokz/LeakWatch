package services

import (
	"encoding/csv"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/google/uuid"
	"github.com/nullisokz/leakwatch/internal/models"
)

var dateFormats = []string{
	"2006-01-02",
	"01/02/2006",
	"02/01/2006",
	"2006/01/02",
	"Jan 2, 2006",
	"2 Jan 2006",
	"02-01-2006",
	"01-02-2006",
	"2006.01.02",
	"02.01.2006",
}

type csvSchema struct {
	dateIdx   int
	descIdx   int
	amountIdx int
	debitIdx  int
	creditIdx int
}

func ParseCSV(r io.Reader, cat *Categorizer) ([]models.Transaction, error) {
	reader := csv.NewReader(r)
	reader.TrimLeadingSpace = true
	reader.LazyQuotes = true

	headers, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("reading headers: %w", err)
	}

	schema, err := detectSchema(headers)
	if err != nil {
		return nil, err
	}

	rows, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("reading rows: %w", err)
	}

	type result struct {
		tx  models.Transaction
		err error
	}

	jobs := make(chan []string, len(rows))
	results := make(chan result, len(rows))

	const workers = 8
	var wg sync.WaitGroup
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for row := range jobs {
				tx, err := parseRow(row, schema, cat)
				results <- result{tx, err}
			}
		}()
	}

	for _, row := range rows {
		jobs <- row
	}
	close(jobs)

	go func() {
		wg.Wait()
		close(results)
	}()

	var transactions []models.Transaction
	for res := range results {
		if res.err != nil {
			continue // skip malformed rows
		}
		if res.tx.Amount <= 0 {
			continue // skip zero/credit rows
		}
		transactions = append(transactions, res.tx)
	}

	return transactions, nil
}

func detectSchema(headers []string) (csvSchema, error) {
	schema := csvSchema{
		dateIdx:   -1,
		descIdx:   -1,
		amountIdx: -1,
		debitIdx:  -1,
		creditIdx: -1,
	}

	for i, h := range headers {
		lower := strings.ToLower(strings.TrimSpace(h))
		switch {
		case contains(lower, "date", "time"):
			schema.dateIdx = i
		case contains(lower, "description", "merchant", "payee", "narrative", "details", "memo", "name"):
			schema.descIdx = i
		case lower == "amount" || lower == "value":
			schema.amountIdx = i
		case contains(lower, "debit", "withdrawal", "charge", "spent"):
			schema.debitIdx = i
		case contains(lower, "credit", "deposit", "income"):
			schema.creditIdx = i
		}
	}

	if schema.dateIdx == -1 {
		return schema, fmt.Errorf("no date column found in CSV; headers: %v", headers)
	}
	if schema.descIdx == -1 {
		return schema, fmt.Errorf("no description column found in CSV; headers: %v", headers)
	}
	if schema.amountIdx == -1 && schema.debitIdx == -1 {
		return schema, fmt.Errorf("no amount column found in CSV; headers: %v", headers)
	}

	return schema, nil
}

func parseRow(row []string, schema csvSchema, cat *Categorizer) (models.Transaction, error) {
	if len(row) == 0 {
		return models.Transaction{}, fmt.Errorf("empty row")
	}

	date, err := parseDate(safeGet(row, schema.dateIdx))
	if err != nil {
		return models.Transaction{}, err
	}

	desc := strings.TrimSpace(safeGet(row, schema.descIdx))
	if desc == "" {
		return models.Transaction{}, fmt.Errorf("empty description")
	}

	amount, err := parseAmount(row, schema)
	if err != nil {
		return models.Transaction{}, err
	}

	return models.Transaction{
		ID:          uuid.New().String(),
		Date:        date,
		Description: desc,
		Amount:      math.Abs(amount),
		Category:    cat.Categorize(desc),
		Currency:    "USD",
	}, nil
}

func parseAmount(row []string, schema csvSchema) (float64, error) {
	if schema.amountIdx >= 0 {
		raw := safeGet(row, schema.amountIdx)
		v, err := cleanNumber(raw)
		if err != nil {
			return 0, err
		}
		return v, nil
	}

	// debit/credit columns
	debitStr := safeGet(row, schema.debitIdx)
	if debitStr != "" {
		v, err := cleanNumber(debitStr)
		if err == nil && v != 0 {
			return v, nil
		}
	}
	return 0, nil
}

func parseDate(raw string) (time.Time, error) {
	raw = strings.TrimSpace(raw)
	for _, f := range dateFormats {
		if t, err := time.Parse(f, raw); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unparseable date: %q", raw)
}

func cleanNumber(s string) (float64, error) {
	s = strings.TrimSpace(s)
	// Remove currency symbols and thousands separators
	s = strings.Map(func(r rune) rune {
		if unicode.IsDigit(r) || r == '.' || r == '-' || r == ',' {
			return r
		}
		return -1
	}, s)
	// Handle European format: 1.234,56 → 1234.56
	if strings.Count(s, ".") > 1 || (strings.Contains(s, ",") && strings.Contains(s, ".") && strings.Index(s, ",") > strings.Index(s, ".")) {
		s = strings.ReplaceAll(s, ".", "")
		s = strings.ReplaceAll(s, ",", ".")
	} else {
		s = strings.ReplaceAll(s, ",", "")
	}
	return strconv.ParseFloat(s, 64)
}

func safeGet(row []string, idx int) string {
	if idx < 0 || idx >= len(row) {
		return ""
	}
	return row[idx]
}

func contains(s string, keywords ...string) bool {
	for _, kw := range keywords {
		if strings.Contains(s, kw) {
			return true
		}
	}
	return false
}
