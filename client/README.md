# EPYC AI Agent Widget

A reusable React overlay assistant that can sit on top of any frontend. The client only calls your backend API; the backend keeps the real model key private.

## Features

- Fixed overlay that works above existing UI
- Compact input state inspired by the assignment reference
- Smooth expansion into a larger chat panel
- Thinking state and chat history rendering
- Configurable backend provider endpoint, with mock mode when no endpoint is set
- Responsive mobile full-screen behavior

## Project Structure

- `client/` - React widget package and demo app
- `server/` - Express API that calls OpenAI securely

## Local Setup

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Add your real server-side key in `server/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Run the backend:

```bash
npm run dev:server
```

Run the client in another terminal:

```bash
npm run dev:client
```

## Usage

After publishing or installing the package, keep your deployed backend URL in
`.env`:

```env
VITE_AI_AGENT_ENDPOINT=https://your-deployed-backend.com/api/chat
```

Then import the CSS once and wrap your app at the root level:

```jsx
import { AiAgentProvider } from "epyc-ai-agent-widget";
import "epyc-ai-agent-widget/style.css";

export function App() {
  return (
    <AiAgentProvider
      title="ProtoAI"
      endpoint={import.meta.env.VITE_AI_AGENT_ENDPOINT}
    >
      <YourExistingUi />
    </AiAgentProvider>
  );
}
```

You can still render the widget manually if you need more control:

```jsx
import { AiAgentWidget } from "epyc-ai-agent-widget";
import "epyc-ai-agent-widget/style.css";

<AiAgentWidget
  title="ProtoAI"
  provider={{
    endpoint: import.meta.env.VITE_AI_AGENT_ENDPOINT,
  }}
/>;
```

## Backend Endpoint Contract

The widget sends this request to `VITE_AI_AGENT_ENDPOINT`:

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
