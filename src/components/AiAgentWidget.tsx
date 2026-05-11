import { ArrowUpRight, Bot, Maximize2, Minimize2, Send, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import "./AiAgentWidget.css";

export type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AiAgentWidgetProps = {
  title?: string;
  placeholder?: string;
  initialMessages?: AgentMessage[];
  onSend?: (message: string, history: AgentMessage[]) => Promise<string>;
};

const defaultMessages: AgentMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am your AI agent. Ask me anything and I will open into a larger workspace when the conversation needs more room.",
  },
];

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

async function defaultResponder(message: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 850));
  return `I received: "${message}". Connect an API key or backend endpoint to make this answer come from your model.`;
}

export function AiAgentWidget({
  title = "AI Agent",
  placeholder = "Ask anything...",
  initialMessages = defaultMessages,
  onSend,
}: AiAgentWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const latestMessages = useMemo(() => messages.slice(-8), [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || isThinking) {
      return;
    }

    const userMessage: AgentMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsOpen(true);
    setIsThinking(true);

    try {
      const response = onSend
        ? await onSend(trimmed, nextMessages)
        : await defaultResponder(trimmed);

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: response,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            "I could not reach the model right now. Please check your API key or chat endpoint.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <aside className={`ai-agent-shell ${isOpen ? "is-open" : ""}`}>
      <div className="ai-agent-panel" aria-live="polite">
        <div className="ai-agent-topbar">
          <button
            className="ai-agent-brand"
            type="button"
            onClick={() => {
              setIsOpen(true);
              window.setTimeout(() => inputRef.current?.focus(), 120);
            }}
            aria-label="Open AI agent"
          >
            <span className="ai-agent-orb">
              <Bot size={28} strokeWidth={1.8} />
            </span>
            <span>{title}</span>
          </button>

          <div className="ai-agent-actions">
            <button
              className="ai-agent-icon-button"
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              aria-label={isOpen ? "Minimize AI agent" : "Expand AI agent"}
            >
              {isOpen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            {isOpen && (
              <button
                className="ai-agent-icon-button"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close AI agent"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="ai-agent-messages">
            {latestMessages.map((message) => (
              <article
                className={`ai-agent-message is-${message.role}`}
                key={message.id}
              >
                {message.content}
              </article>
            ))}
            {isThinking && (
              <div className="ai-agent-thinking">
                <span />
                <span />
                <span />
                Thinking
              </div>
            )}
          </div>
        )}

        <form className="ai-agent-composer" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={input}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          <button
            className="ai-agent-send"
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || isThinking}
          >
            {isOpen ? <Send size={18} /> : <ArrowUpRight size={22} />}
          </button>
        </form>
      </div>
    </aside>
  );
}
