# LeakWatch

> Personal expense & subscription tracker — upload a bank statement CSV, instantly see where your money goes.

![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## Features

- **Drag & drop CSV upload** — supports common bank export formats (date/description/amount, debit/credit columns, etc.)
- **Concurrent parsing** — Go worker pool processes thousands of rows in milliseconds
- **Auto-categorisation** — 15 categories inferred from merchant names (Streaming, Dining, Groceries, Gaming…)
- **Subscription detection** — identifies recurring charges by merchant + interval + amount heuristics
- **Renewal calendar** — shows next charge date per subscription, highlighted when due soon
- **Monthly trend chart** — area chart of spending over time
- **Category breakdown** — interactive donut chart; click a slice to filter transactions
- **Paginated transaction table** — filter by category, paginate through all rows
- **Session-based** — no database, no auth; parsed data lives in memory for 1 hour

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Go 1.22, chi router, in-memory session store |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Infra | Docker Compose |

## Quick Start

### With Docker

```bash
docker compose up --build
# API: http://localhost:8080
# App: http://localhost:3000
```

### Local Development

```bash
# Backend
cd backend
go mod tidy
go run ./cmd/server

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## CSV Format

LeakWatch auto-detects column layout. Common formats that work out of the box:

```
Date,Description,Amount
2024-01-15,Netflix,-15.99
2024-01-14,Uber Eats,-32.50
```

```
Date,Merchant,Debit,Credit
2024-01-15,Spotify,9.99,
2024-01-14,Amazon,124.00,
```

Any CSV with at least a **date column**, a **description/merchant column**, and an **amount/debit column** will be parsed.

## Architecture

```
backend/
├── cmd/server/main.go          # HTTP server entry point
└── internal/
    ├── handlers/
    │   ├── upload.go           # POST /api/upload
    │   └── data.go             # GET summary / subscriptions / transactions
    ├── models/                 # Transaction, Subscription, Summary structs
    ├── services/
    │   ├── parser.go           # CSV parsing with goroutine worker pool
    │   ├── categorizer.go      # Keyword-based auto-categorisation
    │   ├── detector.go         # Subscription detection heuristics
    │   └── summarizer.go       # Monthly and category aggregation
    └── store/                  # In-memory session store with TTL cleanup

frontend/src/
├── api/client.ts               # Axios API client
├── components/
│   ├── Upload.tsx              # Dropzone upload screen
│   ├── Dashboard.tsx           # Tab layout controller
│   ├── SummaryCards.tsx        # KPI cards row
│   ├── SpendingChart.tsx       # Monthly area chart
│   ├── CategoryChart.tsx       # Category donut chart
│   ├── SubscriptionList.tsx    # Renewals table
│   └── TransactionTable.tsx   # Paginated transaction list
└── types/index.ts              # Shared TypeScript types
```
