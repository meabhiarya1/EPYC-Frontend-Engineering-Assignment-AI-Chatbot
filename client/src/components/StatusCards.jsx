const cards = [
  ["Installed package", "ai-chatbot-package-demo@latest"],
  ["Provider location", "AiAgentProvider wraps <App /> in main.jsx"],
  ["Backend endpoint", "Loaded from VITE_AI_AGENT_ENDPOINT"],
];

export function StatusCards() {
  return (
    <section className="demo-grid" aria-label="Package integration status">
      {cards.map(([label, value]) => (
        <article className="demo-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}
