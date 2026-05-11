# EPYC AI Agent Widget

A reusable React overlay assistant that can sit on top of any frontend. It starts as a compact transparent-black input box and expands into a larger chat workspace when the user focuses or sends a message.

## Features

- Fixed overlay that works above existing UI
- Compact input state inspired by the assignment reference
- Smooth expansion into a larger chat panel
- Thinking state and chat history rendering
- Configurable provider: backend endpoint, OpenAI-compatible API key, or mock mode
- Responsive mobile full-screen behavior

## Local Setup

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` when you want to connect a model.

```bash
cp .env.example .env
```

For production, prefer `VITE_AI_AGENT_ENDPOINT` so API keys stay on your server. Direct browser API keys are included only for quick demo/testing.

## Usage

```jsx
import { AiAgentWidget } from "./components/AiAgentWidget";

export function App() {
  return (
    <>
      <YourExistingUi />
      <AiAgentWidget
        title="ProtoAI"
        provider={{
          endpoint: import.meta.env.VITE_AI_AGENT_ENDPOINT,
          apiKey: import.meta.env.VITE_AI_AGENT_API_KEY,
          model: import.meta.env.VITE_AI_AGENT_MODEL,
        }}
      />
    </>
  );
}
```

## Backend Endpoint Contract

If you provide `VITE_AI_AGENT_ENDPOINT`, the widget sends:

```json
{
  "message": "User message",
  "history": []
}
```

The endpoint should return:

```json
{
  "reply": "Assistant response"
}
```

## Commit Strategy

This project is intentionally developed in small commits:

- Project setup
- Floating overlay UI
- Configurable chat provider
- Documentation and demo configuration
- Polish, testing, and deployment notes
