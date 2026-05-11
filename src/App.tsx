import { AiAgentWidget } from "./components/AiAgentWidget";

export default function App() {
  return (
    <>
      <main className="demo-page">
        <section className="demo-hero">
          <p className="demo-kicker">Reusable frontend package</p>
          <h1>AI Agent Widget</h1>
          <p>
            A transparent overlay assistant that can sit on top of any React UI.
          </p>
        </section>
      </main>
      <AiAgentWidget title="ProtoAI" />
    </>
  );
}
