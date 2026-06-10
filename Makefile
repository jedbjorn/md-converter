.PHONY: dev build preview deploy

dev:       ## Run the dev server (vite)
	npm run dev

build:     ## Build the static site into ./build
	npm run build

preview:   ## Preview the production build locally
	npm run preview

deploy: build  ## Build, then deploy to Cloudflare Workers
	npx wrangler deploy
