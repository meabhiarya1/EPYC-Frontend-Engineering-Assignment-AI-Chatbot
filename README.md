# EPYC AI Agent Widget

Installable React AI chatbot overlay for any frontend application. Add the package, set one environment variable for the deployed backend, wrap your app once, and the assistant is ready to use.

## Install

```bash
npm install epyc-ai-agent-widget
```

The package expects your app to already use React. It renders a floating AI chat widget at the app level and sends chat requests to the configured backend endpoint.

## Environment Variable

Create or update your frontend `.env` file:

```env
VITE_AI_AGENT_ENDPOINT=https://epyc-frontend-engineering-assignment-ai.onrender.com/api/chat
```

This endpoint points to the deployed backend API. The frontend package does not need any OpenAI API key because the backend handles the model request securely.

After changing `.env`, restart your frontend dev server so Vite can load the new value.

## Wrap Your App

Import the provider and package CSS once at the top level of your app.

```jsx
import { AiAgentProvider } from "epyc-ai-agent-widget";
import "epyc-ai-agent-widget/style.css";

export default function App() {
  return (
    <AiAgentProvider
      title="ProtoAI"
      endpoint={import.meta.env.VITE_AI_AGENT_ENDPOINT}
    >
      <YourExistingApp />
    </AiAgentProvider>
  );
}
```

That is the main integration. The provider renders your app normally and places the AI chatbot overlay above the UI.

## Available Props

```jsx
<AiAgentProvider
  title="ProtoAI"
  placeholder="Ask anything..."
  endpoint={import.meta.env.VITE_AI_AGENT_ENDPOINT}
>
  <YourExistingApp />
</AiAgentProvider>
```

`title` controls the widget label.

`placeholder` controls the input placeholder text.

`endpoint` is the backend chat API URL. For this assignment, use:

```env
VITE_AI_AGENT_ENDPOINT=https://epyc-frontend-engineering-assignment-ai.onrender.com/api/chat
```

## What The Package Does

The package adds a bottom-centered AI chatbot overlay to any React UI.

It starts compact, expands smoothly after sending a message, keeps the input at the bottom, stores chat history in `localStorage`, restores saved chats after reload, and lets users clear the chat with the close or new-chat controls.

The frontend calls only the backend endpoint. No model API key is exposed in the browser.

## Backend Request

The widget sends requests to `VITE_AI_AGENT_ENDPOINT` like this:

```json
{
  "message": "User message",
  "history": []
}
```

The backend returns:

```json
{
  "reply": "Assistant response",
  "assistant": {
    "answer": "Assistant response",
    "suggestedQuestions": [
      "Useful follow-up question?",
      "Another follow-up question?"
    ]
  }
}
```

The current widget uses `reply` for display. The structured `assistant` object is available for future UI improvements such as suggested follow-up buttons.

## Manual Widget Usage

Use the provider for most apps. If you need manual placement, import the widget directly:

```jsx
import { AiAgentWidget } from "epyc-ai-agent-widget";
import "epyc-ai-agent-widget/style.css";

export function App() {
  return (
    <>
      <YourExistingApp />
      <AiAgentWidget
        title="ProtoAI"
        provider={{
          endpoint: import.meta.env.VITE_AI_AGENT_ENDPOINT,
        }}
      />
    </>
  );
}
```

## Summary

1. Install the package.
2. Add `VITE_AI_AGENT_ENDPOINT` in `.env`.
3. Import the package CSS.
4. Wrap your app with `AiAgentProvider`.
5. Run your frontend and start chatting.
