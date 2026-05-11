import cors from "cors";
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3001;
const invalidKeyMessage =
  "The server OpenAI API key is invalid or still set to the placeholder. Update server/.env with a real OPENAI_API_KEY and restart the backend.";

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/api/chat", async (request, response) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey || apiKey === "your_api_key_here") {
      return response.status(500).json({
        error: invalidKeyMessage,
      });
    }

    const { message, history = [] } = request.body;

    if (!message || typeof message !== "string") {
      return response.status(400).json({
        error: "Request body must include a message string.",
      });
    }

    const openai = new OpenAI({
      apiKey,
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
    const openAiStatus = error?.status;
    const openAiCode = error?.code;

    if (openAiStatus === 401 || openAiCode === "invalid_api_key") {
      console.warn("Chat API auth error: invalid OpenAI API key.");

      return response.status(401).json({
        error: invalidKeyMessage,
      });
    }

    if (openAiStatus === 429) {
      console.warn("Chat API rate limit/quota error.");

      return response.status(429).json({
        error:
          "The model provider is rate limited or out of quota. Please check the server billing/quota settings and try again.",
      });
    }

    console.error("Chat API error:", error?.message || error);

    return response.status(500).json({
      error:
        "The assistant backend could not generate a response right now. Please try again in a moment.",
    });
  }
});

app.listen(port, () => {
  console.log(`AI backend running on http://localhost:${port}`);
});
