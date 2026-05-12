import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AiAgentProvider } from "ai-chatbot-package-demo";
import "ai-chatbot-package-demo/style.css";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AiAgentProvider
      title="ProtoAI"
      endpoint={import.meta.env.VITE_AI_AGENT_ENDPOINT}
    >
      <App />
    </AiAgentProvider>
  </StrictMode>
);
