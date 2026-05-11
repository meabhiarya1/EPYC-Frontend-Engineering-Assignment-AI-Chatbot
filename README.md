# EPYC AI Agent Widget Workspace

This repo is split into:

- `client/` - React widget package and demo
- `server/` - Backend API that keeps the model key private

Start here:

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
npm run dev:server
npm run dev:client
```

Full client notes live in `client/README.md`.
