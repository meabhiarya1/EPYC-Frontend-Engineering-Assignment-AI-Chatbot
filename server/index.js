import cors from "cors";
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/chat", async (request, response) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return response.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server.",
      });
    }

    const { message, history = [] } = request.body;

    if (!message || typeof message !== "string") {
      return response.status(400).json({
        error: "Request body must include a message string.",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const conversation = history
      .filter((item) => item?.role && item?.content)
      .map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: String(item.content),
      }));

    const result = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions:
        process.env.AI_AGENT_SYSTEM_PROMPT ||
        "You are a concise, helpful AI assistant embedded inside a web application UI.",
      input: [
        ...conversation,
        {
          role: "user",
          content: message,
        },
      ],
    });

    return response.json({
      reply: result.output_text || "I could not generate a response.",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return response.status(500).json({
      error: "Failed to generate assistant response.",
    });
  }
});

app.listen(port, () => {
  console.log(`AI backend running on http://localhost:${port}`);
});
