import cors from "cors";
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3001;
const invalidKeyMessage =
  "The server OpenAI API key is invalid or still set to the placeholder. Update server/.env with a real OPENAI_API_KEY and restart the backend.";
const assistantInstructions = [
  "You are a concise, helpful AI assistant embedded inside a web application UI.",
  "Answer the user's latest message using the provided conversation history when it is useful.",
  "Return only valid JSON. Do not wrap the response in markdown.",
  "Use this exact shape:",
  '{"answer":"A concise helpful response for the user.","suggestedQuestions":["A useful follow-up question?","Another useful follow-up question?"]}',
  "Keep answer as a plain string and suggestedQuestions as 2 to 3 short strings.",
].join("\n");

function parseAssistantResponse(outputText) {
  const fallback = {
    answer: outputText || "I could not generate a response.",
    suggestedQuestions: [],
  };

  if (!outputText) {
    return fallback;
  }

  try {
    const jsonText = outputText
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(jsonText);
    const answer =
      typeof parsed.answer === "string" && parsed.answer.trim()
        ? parsed.answer.trim()
        : fallback.answer;
    const suggestedQuestions = Array.isArray(parsed.suggestedQuestions)
      ? parsed.suggestedQuestions
          .filter((question) => typeof question === "string")
          .map((question) => question.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];

    return {
      answer,
      suggestedQuestions,
    };
  } catch {
    return fallback;
  }
}

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
      instructions: assistantInstructions,
      input: [
        ...conversation,
        {
          role: "user",
          content: message,
        },
      ],
    });
    const assistant = parseAssistantResponse(result.output_text);

    return response.json({
      reply: assistant.answer,
      assistant,
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
