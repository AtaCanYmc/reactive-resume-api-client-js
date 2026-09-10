.PHONY: help install build typecheck test test-watch test-cov check build-demo demo docker-up docker-down docker-logs clean publish-dry publish

# Default target
.DEFAULT_GOAL := help

# Color helpers
CYAN  := \033[36m
GREEN := \033[32m
RESET := \033[0m

help: ## Show this help menu
	@echo ""
	@echo "$(CYAN)reactive-resume-api-client-js$(RESET) Developer Commands"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

install: ## Install project dependencies
	npm install

build: ## Build ESM and CommonJS bundles with TypeScript declarations
	npm run build

typecheck: ## Run TypeScript compiler typecheck (no emit)
	npm run typecheck

test: ## Run unit tests with Vitest
	npm test

test-watch: ## Run unit tests in watch mode
	npm run test:watch

test-cov: ## Run unit tests with coverage report
	npm run test:coverage

check: typecheck test build ## Run full verification pipeline (typecheck + test + build)
	@echo "\n$(GREEN)✔ All verification checks passed!$(RESET)\n"

build-demo: ## Build SDK and copy bundle into demo/web/vendor
	npm run build:demo

demo: build-demo ## Start local demo server (API :3000, Web :3001)
	@docker compose down 2>/dev/null || true
	node demo/backend/server.js

docker-up: ## Build and start demo in Docker (API :3000, Web :3001)
	@lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true
	docker compose up --build -d

docker-down: ## Stop and remove demo container
	docker compose down

docker-logs: ## Tail demo container logs
	docker compose logs -f

clean: ## Remove build outputs, coverage, and cached assets
	rm -rf dist coverage demo/web/vendor
	@echo "$(GREEN)✔ Cleaned build artifacts.$(RESET)"

publish-dry: check ## Inspect npm package tarball without publishing
	npm publish --dry-run

publish: check ## Publish package to npm public registry
	npm publish --access public
