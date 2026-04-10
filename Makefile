.PHONY: up down build logs shell-backend shell-frontend migrate seed fresh test-backend install-backend

# =============================================================================
# Blooprint — Makefile
# Usage: make <commande>
# =============================================================================

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

migrate:
	docker compose exec backend php artisan migrate

seed:
	docker compose exec backend php artisan db:seed

fresh:
	docker compose exec backend php artisan migrate:fresh --seed

test-backend:
	docker compose exec backend php artisan test

install-backend:
	docker compose exec backend composer install

# Production
up-prod:
	docker compose -f docker-compose.prod.yml up -d

down-prod:
	docker compose -f docker-compose.prod.yml down

build-prod:
	docker compose -f docker-compose.prod.yml build --no-cache
