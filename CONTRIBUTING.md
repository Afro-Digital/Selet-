# Contributing to Selet (ስሌት)

Thank you for your interest in contributing to Selet!

## Development Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. Verify code before submitting:
   ```bash
   pnpm typecheck
   pnpm test
   pnpm lint
   pnpm format:check
   ```
5. Follow conventional commits (e.g. `feat: ...`, `fix: ...`, `test: ...`, `docs: ...`).
6. Submit a Pull Request targeting `main`.
