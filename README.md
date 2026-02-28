# VBJC Monorepo (VISTA Bridge Joint Codebase)

This repository consolidates the VISTA Bridge ecosystem into one cohesive codebase.

## Repository Layout

- `apps/vista-bridge`: React + Vite bridge frontend (from `Agrow-Labs/vista-bridge`)
- `services/bridge-offchain`: Offchain bridge/indexer/relayer service (from `vista-foundation/bridge-offchain`)
- `contracts/smart-contracts`: On-chain smart contracts and demos (from `vista-foundation/smart-contracts`)
- `docs/documentation`: Foundation documentation repo (from `vista-foundation/documentation`)
- `docs/design-docs`: Architecture and protocol design docs (from `vista-foundation/design-docs`)
- `.github/profile`: Organization profile docs (from `vista-foundation/.github`)

## Quick Start

From repository root:

```bash
npm run install:all
```

Run frontend:

```bash
npm run dev:web
```

Run offchain bridge service:

```bash
npm run dev:offchain
```

Build both Node/TypeScript projects:

```bash
npm run build:all
```

## Notes

- Smart contract subprojects include their own build/runtime tooling (Aiken, npm/pnpm scripts where provided).
- Some scripts in imported repos are Unix-oriented; use Git Bash/WSL on Windows where needed.
