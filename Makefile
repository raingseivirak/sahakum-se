.PHONY: help setup dev build start env docker-up docker-down docker-logs db-push db-seed db-reset db-studio db-migrate lint type-check sync-media clean

# Default target - show help
help:
	@echo "Sahakum Khmer CMS - Development Commands"
	@echo ""
	@echo "Setup & Run:"
	@echo "  make setup     - Full setup (Docker + DB + seed admin)"
	@echo "  make env       - Copy .env.example to .env (and .env.local)"
	@echo "  make dev       - Start development server"
	@echo "  make build     - Build for production"
	@echo "  make start     - Start production server"
	@echo ""
	@echo "Database:"
	@echo "  make docker-up   - Start PostgreSQL container"
	@echo "  make docker-down - Stop PostgreSQL container"
	@echo "  make docker-logs - View database logs"
	@echo "  make db-push     - Sync schema to database"
	@echo "  make db-seed     - Seed admin user"
	@echo "  make db-reset    - Reset database and re-seed"
	@echo "  make db-studio   - Open Prisma Studio"
	@echo "  make db-migrate  - Run migrations (production)"
	@echo ""
	@echo "Other:"
	@echo "  make lint       - Run linting"
	@echo "  make type-check - Run TypeScript check"
	@echo "  make sync-media - Sync media files"

# Copy env file(s) if they don't exist (Prisma needs .env, Next.js uses .env.local)
env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env from .env.example (required for Prisma)"; \
	else \
		echo ".env already exists"; \
	fi
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "Created .env.local from .env.example (for Next.js)"; \
	else \
		echo ".env.local already exists"; \
	fi

# Full one-command setup
setup: env
	@npm install
	@$(MAKE) docker-up
	@sleep 3
	@npm run db:push
	@npm run db:seed
	@echo ""
	@echo "Setup complete! Run 'make dev' to start the server."
	@echo "Admin login: admin@sahakumkhmer.se / HelloCambodia123"

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Start production server
start:
	npm start

# Docker
docker-up:
	npm run docker:up

docker-down:
	npm run docker:down

docker-logs:
	npm run docker:logs

# Database
db-push:
	npm run db:push

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

db-studio:
	npm run db:studio

db-migrate:
	npm run db:migrate

# Code quality
lint:
	npm run lint

type-check:
	npm run type-check

# Media
sync-media:
	npm run sync-media
