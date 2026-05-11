import {
  ArrowUpRight,
  Bot,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAgentReply } from "../lib/chatProvider";
import "./AiAgentWidget.css";

const defaultMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am your AI agent. Ask me anything and I will open into a larger workspace when the conversation needs more room.",
  },
];

const storageKey = "epyc-ai-agent-widget:messages";

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function getStoredMessages() {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const storedMessages = window.localStorage.getItem(storageKey);

    if (!storedMessages) {
      return null;
    }

    const parsedMessages = JSON.parse(storedMessages);

    return Array.isArray(parsedMessages) && parsedMessages.length
      ? parsedMessages
      : null;
  } catch {
    return null;
  }
}

function hasSavedConversation(messages) {
  return Boolean(messages?.some((message) => message.role === "user"));
}

export function AiAgentWidget({
  title = "AI Agent",
  placeholder = "Ask anything...",
  initialMessages = defaultMessages,
  provider = {},
  onSend,
}) {
  const resetMessages = useMemo(() => initialMessages, [initialMessages]);
  const storedMessages = useMemo(() => getStoredMessages(), []);
  const [isOpen, setIsOpen] = useState(() =>
    hasSavedConversation(storedMessages)
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() =>
    storedMessages?.length ? storedMessages : resetMessages
  );
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const shouldSkipNextPersistRef = useRef(false);

  useEffect(() => {
    if (shouldSkipNextPersistRef.current) {
      shouldSkipNextPersistRef.current = false;
      window.localStorage.removeItem(storageKey);
      return;
    }

    if (!hasSavedConversation(messages)) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages, isThinking]);

  function revealAssistantMessage(content) {
    const messageId = createId();
    const tokens = content.match(/\S+\s*/g) ?? [content];

    setTypingMessageId(messageId);
    setIsTyping(true);
    setMessages((current) => [
      ...current,
      {
        id: messageId,
        role: "assistant",
        content: "",
      },
    ]);

    return new Promise((resolve) => {
      let tokenIndex = 0;

      const intervalId = window.setInterval(() => {
        tokenIndex += 1;
        const nextContent = tokens.slice(0, tokenIndex).join("");

        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: nextContent,
                }
              : message
          )
        );

        if (tokenIndex >= tokens.length) {
          window.clearInterval(intervalId);
          setTypingMessageId(null);
          setIsTyping(false);
          resolve();
        }
      }, 54);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed || isThinking || isTyping) {
      return;
    }

    const userMessage = {
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
        : await getAgentReply(trimmed, nextMessages, provider);

      setIsThinking(false);
      await revealAssistantMessage(response);
    } catch (error) {
      setIsThinking(false);
      await revealAssistantMessage(
        error?.message ||
          "I could not reach the model right now. Please check your API key or chat endpoint."
      );
    } finally {
      setIsThinking(false);
      setIsTyping(false);
    }
  }

  async function handleCopy(message) {
    if (!message.content) {
      return;
    }

    await navigator.clipboard?.writeText(message.content);
    setCopiedMessageId(message.id);

    window.setTimeout(() => {
      setCopiedMessageId((currentId) =>
        currentId === message.id ? null : currentId
      );
    }, 1200);
  }

  function clearChat({ keepOpen } = { keepOpen: false }) {
    shouldSkipNextPersistRef.current = true;
    setMessages(resetMessages);
    setInput("");
    setIsThinking(false);
    setIsTyping(false);
    setTypingMessageId(null);
    setCopiedMessageId(null);
    window.localStorage.removeItem(storageKey);
    setIsOpen(keepOpen);

    if (keepOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
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
            {isOpen && (
              <button
                className="ai-agent-icon-button"
                type="button"
                onClick={() => clearChat({ keepOpen: true })}
                aria-label="Start new chat"
              >
                <Plus size={18} />
              </button>
            )}
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
                onClick={() => clearChat({ keepOpen: false })}
                aria-label="Clear and close AI agent"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="ai-agent-messages" ref={messagesRef}>
            {messages.map((message) => (
              <article
                className={`ai-agent-message is-${message.role} ${
                  typingMessageId === message.id ? "is-typing" : ""
                }`}
                key={message.id}
              >
                {message.content}
                {typingMessageId === message.id && (
                  <span className="ai-agent-cursor" />
                )}
                {message.role === "assistant" &&
                  typingMessageId !== message.id &&
                  message.content && (
                    <button
                      className="ai-agent-copy"
                      type="button"
                      onClick={() => handleCopy(message)}
                      aria-label="Copy assistant response"
                    >
                      {copiedMessageId === message.id ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
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
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          <button
            className="ai-agent-send"
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || isThinking || isTyping}
          >
            {isOpen ? <Send size={18} /> : <ArrowUpRight size={22} />}
          </button>
        </form>
        <p className="ai-agent-disclaimer">
          AI may be imperfect at times. Please re-check the responses.
        </p>
      </div>
    </aside>
  );
}
