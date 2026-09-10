.PHONY: help install build typecheck test test-watch test-cov check build-demo demo clean publish-dry publish

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

demo: build-demo ## Start local web demo preview server
	npm run preview:demo

clean: ## Remove build outputs, coverage, and cached assets
	rm -rf dist coverage demo/web/vendor
	@echo "$(GREEN)✔ Cleaned build artifacts.$(RESET)"

publish-dry: check ## Inspect npm package tarball without publishing
	npm publish --dry-run

publish: check ## Publish package to npm public registry
	npm publish --access public
