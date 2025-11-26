# AGENTS.md

## Build/Lint/Test Commands
- Build: `pnpm run build` (compiles TypeScript to `dist/`)
- Run: `node dist/connect-chrome.js` or `make run`
- Type-check: `pnpx tsc --noEmit` (stress using pnpx for testing)
- No linting or testing configured yet. Add ESLint/Prettier if needed.

## Code Style Guidelines
- **Language**: TypeScript with `strict: false` for flexibility.
- **Imports**: ES6 imports; use `import type` for type-only imports.
- **Formatting**: Standard indentation; no enforced formatter.
- **Types**: Add return types to functions; use interfaces for complex objects.
- **Naming**: camelCase for variables/functions; PascalCase for types.
- **Async**: Use async/await; handle promises with try-catch.
- **Error Handling**: Wrap risky operations in try-catch; log errors.
- **Comments**: Minimal; explain complex logic only.

Refer to README.md for setup and usage.