-include .env
export

.PHONY: help up down logs install dev build lint typecheck test docker-build

help: ## Show the available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-14s %s\n", $$1, $$2}'

up: ## Build the images and run the interface with its gateway (http://localhost:8080)
	docker compose up -d --build --wait

down: ## Stop and remove the containers
	docker compose down

logs: ## Follow the frontend and gateway logs
	docker compose logs -f

install: ## Install the dependencies exactly as locked
	npm ci

dev: ## Run the development server on the host (http://localhost:3000)
	npm run dev

build: ## Production build into .next/
	npm run build

lint: ## ESLint
	npm run lint

typecheck: ## TypeScript, no output
	npm run typecheck

test: ## Unit tests
	npm test

docker-build: ## Build the container images
	docker compose build
