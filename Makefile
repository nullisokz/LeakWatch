.PHONY: dev backend frontend install build

# Start both servers concurrently
dev:
	@make -j2 backend frontend

backend:
	cd backend && go run ./cmd/server

frontend:
	cd frontend && npm run dev

install:
	cd backend && go mod tidy
	cd frontend && npm install

build:
	cd backend && go build -o bin/leakwatch ./cmd/server
	cd frontend && npm run build

docker:
	docker compose up --build

.PHONY: test
test:
	cd backend && go test ./...
