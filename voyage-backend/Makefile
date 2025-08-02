.PHONY: help install dev up down seed reset-db demo clean logs test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install Python dependencies
	pip install -r requirements.txt

dev: ## Start development environment (MongoDB + Redis + API)
	docker-compose up -d

up: dev ## Alias for dev

down: ## Stop all services
	docker-compose down

seed: ## Seed database with demo data
	docker-compose --profile seed run --rm seed

reset-db: ## Reset database and seed with fresh data
	docker-compose down -v
	docker-compose up -d redis
	@echo "Seeding MongoDB Atlas with fresh data..."
	docker-compose --profile seed run --rm seed

demo: reset-db ## Setup complete demo environment with fresh data
	docker-compose up -d api
	@echo ""
	@echo "🎉 Demo environment ready!"
	@echo "API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "Database: MongoDB Atlas (production)"
	@echo ""

clean: ## Clean up containers and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

logs: ## Show API logs
	docker-compose logs -f api

logs-db: ## Show MongoDB logs
	docker-compose logs -f mongodb

test: ## Run tests
	pytest

test-cov: ## Run tests with coverage
	pytest --cov=src

# Database commands
db-shell: ## Access MongoDB shell
	docker exec -it voyage_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin voyage_db

db-stats: ## Show database statistics
	docker exec -it voyage_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin voyage_db --eval "db.stats()"

# Seed data with custom parameters
seed-small: ## Seed with minimal data (15 agents, 45 hotels, 75 offers)
	docker-compose --profile seed run --rm seed python scripts/seed_data.py --agents 15 --hotels 45 --offers 75

seed-large: ## Seed with large dataset (50 agents, 150 hotels, 300 offers)
	docker-compose --profile seed run --rm seed python scripts/seed_data.py --agents 50 --hotels 150 --offers 300

# Development helpers
build: ## Rebuild Docker images
	docker-compose build

restart: ## Restart all services
	docker-compose restart

status: ## Show service status
	docker-compose ps