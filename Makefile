build:
	@echo "Building project..."
	pnpm run build
	@echo "Build complete."

run:
	@echo "Running script..."
	node dist/connect-chrome.js

full: build run
