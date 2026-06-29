.PHONY: dev

dev:
	@docker compose -f docker-compose.sunbi-rsshub.yml up -d --build