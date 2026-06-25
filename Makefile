.PHONY: dev build preview deploy

dev:       ## Run the dev server (vite)
	npm run dev

build:     ## Build the static site into ./build
	npm run build

preview:   ## Preview the production build locally
	npm run preview

deploy: build  ## Build, then deploy to Cloudflare Workers
	npx wrangler deploy

# super-coder convenience aliases (designs-OS 'dos-' command standard).
# Appended by ./sc; every target is dos--prefixed so it can't collide with
# this Makefile's own targets. Delete this line to opt out — `./sc <cmd>`
# stays equivalent.
-include .super-coder/aliases.mk
