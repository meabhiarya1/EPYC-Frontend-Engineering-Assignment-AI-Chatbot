import { AiAgentWidget } from "./components/AiAgentWidget";

const activity = [
  ["Lead scoring", "High intent", "92%"],
  ["Investor brief", "Ready", "18m"],
  ["User research", "In review", "7"],
];

const insights = [
  "Summarized 42 customer notes into four product themes.",
  "Found three high-priority follow-ups from founder calls.",
  "Prepared a seed-stage investor update draft.",
];

export default function App() {
  const provider = {
    endpoint: import.meta.env.VITE_AI_AGENT_ENDPOINT,
  };

  return (
    <>
      <main className="demo-page">
        <nav className="demo-nav" aria-label="Demo navigation">
          <div className="demo-mark">A</div>
          <div className="demo-nav-links">
            <span>Workspace</span>
            <span>Signals</span>
            <span>Pipeline</span>
          </div>
          <button type="button">Preview</button>
        </nav>

        <section className="demo-layout">
          <div className="demo-copy">
            <p className="demo-kicker">Reusable frontend package</p>
            <h1>AI agent layer for any product UI</h1>
            <p>
              Drop a compact assistant into your app. It stays centered at the
              bottom, opens smoothly, and can connect to your own model endpoint.
            </p>
            <div className="demo-actions">
              <button type="button">Install package</button>
              <a href="https://atoms.accel.com">Reference site</a>
            </div>
          </div>

          <div className="demo-product" aria-label="Demo product dashboard">
            <div className="demo-product-header">
              <div>
                <span>Growth cockpit</span>
                <strong>Monday focus</strong>
              </div>
              <div className="demo-status">Live</div>
            </div>

            <div className="demo-metrics">
              <article>
                <span>Qualified leads</span>
                <strong>128</strong>
              </article>
              <article>
                <span>Response time</span>
                <strong>1.8s</strong>
              </article>
              <article>
                <span>Tasks closed</span>
                <strong>74%</strong>
              </article>
            </div>

            <div className="demo-grid">
              <section className="demo-card demo-card-wide">
                <div className="demo-card-title">
                  <span>Agent insights</span>
                  <small>Auto generated</small>
                </div>
                <ul>
                  {insights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="demo-card">
                <div className="demo-card-title">
                  <span>Activity</span>
                  <small>Now</small>
                </div>
                <div className="demo-activity-list">
                  {activity.map(([name, status, value]) => (
                    <div className="demo-activity" key={name}>
                      <div>
                        <strong>{name}</strong>
                        <span>{status}</span>
                      </div>
                      <em>{value}</em>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <AiAgentWidget title="ProtoAI" provider={provider} />
    </>
  );
}
