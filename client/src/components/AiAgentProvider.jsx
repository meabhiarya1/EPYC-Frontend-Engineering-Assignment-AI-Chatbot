import { AiAgentWidget } from "./AiAgentWidget";

export function AiAgentProvider({
  children,
  endpoint,
  provider,
  title = "AI Agent",
  placeholder = "Ask anything...",
  initialMessages,
  onSend,
}) {
  const widgetProvider = provider ?? {
    endpoint,
  };

  return (
    <>
      {children}
      <AiAgentWidget
        title={title}
        placeholder={placeholder}
        initialMessages={initialMessages}
        provider={widgetProvider}
        onSend={onSend}
      />
    </>
  );
}
