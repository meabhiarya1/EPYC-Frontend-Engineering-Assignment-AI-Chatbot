import cors from "cors";
import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 3001;
const invalidKeyMessage =
  "The server Gemini API key is missing, invalid, or still set to the placeholder. Update server/.env with a real GEMINI_API_KEY and restart the backend.";
const assistantInstructions = [
  "You are a concise, helpful AI assistant embedded inside a web application UI.",
  "Answer the user's latest message using the provided conversation history when it is useful.",
  "Return only valid JSON. Do not wrap the response in markdown.",
  "Use this exact shape:",
  '{"answer":"A concise helpful response for the user.","suggestedQuestions":["A useful follow-up question?","Another useful follow-up question?"]}',
  "Do not include any text before or after the JSON object.",
  "Keep answer as a plain string and suggestedQuestions as 2 to 3 short strings.",
].join("\n");

function extractJsonObject(outputText) {
  if (!outputText) {
    return "";
  }

  const cleaned = outputText
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const startIndex = cleaned.indexOf("{");

  if (startIndex === -1) {
    return cleaned;
  }

  let depth = 0;
  let isInsideString = false;
  let isEscaped = false;

  for (let index = startIndex; index < cleaned.length; index += 1) {
    const character = cleaned[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (character === "\\") {
      isEscaped = true;
      continue;
    }

    if (character === '"') {
      isInsideString = !isInsideString;
      continue;
    }

    if (isInsideString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;
    }

    if (depth === 0) {
      return cleaned.slice(startIndex, index + 1);
    }
  }

  return cleaned;
}

function normalizeSuggestedQuestions(suggestedQuestions) {
  return Array.isArray(suggestedQuestions)
    ? suggestedQuestions
        .filter((question) => typeof question === "string")
        .map((question) => question.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
}

function parseAssistantResponse(outputText) {
  if (!outputText) {
    return {
      answer: "I could not generate a response.",
      suggestedQuestions: [],
    };
  }

  try {
    const parsed = JSON.parse(extractJsonObject(outputText));

    return {
      answer:
        typeof parsed.answer === "string" && parsed.answer.trim()
          ? parsed.answer.trim()
          : "I could not generate a response.",
      suggestedQuestions: normalizeSuggestedQuestions(
        parsed.suggestedQuestions
      ),
    };
  } catch {
    console.warn("Gemini returned non-JSON assistant text.");

    return {
      answer:
        "I received a malformed model response. Please try again with a shorter question.",
      suggestedQuestions: [
        "Can you answer that again?",
        "Can you summarize your response?",
        "What can you help me with?",
      ],
    };
  }
}

function toGeminiContent(item) {
  return {
    role: item.role === "assistant" ? "model" : "user",
    parts: [
      {
        text: String(item.content),
      },
    ],
  };
}

function extractGeminiText(result) {
  return (
    result?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim() || ""
  );
}

async function createGeminiResponse({ apiKey, message, history }) {
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const conversation = history
    .filter((item) => item?.role && item?.content)
    .map(toGeminiContent);

  const geminiResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: assistantInstructions,
          },
        ],
      },
      contents: [
        ...conversation,
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  const result = await geminiResponse.json().catch(() => ({}));

  if (!geminiResponse.ok) {
    const error = new Error(
      result?.error?.message || "Gemini API request failed."
    );
    error.status = geminiResponse.status;
    error.code = result?.error?.status;
    throw error;
  }

  return extractGeminiText(result);
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
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey || apiKey === "your_gemini_key_here") {
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

    const outputText = await createGeminiResponse({
      apiKey,
      message,
      history,
    });
    const assistant = parseAssistantResponse(outputText);

    return response.json({
      reply: assistant.answer,
      assistant,
    });
  } catch (error) {
    const geminiStatus = error?.status;
    const geminiCode = error?.code;

    if (
      geminiStatus === 400 ||
      geminiStatus === 401 ||
      geminiStatus === 403 ||
      geminiCode === "PERMISSION_DENIED" ||
      geminiCode === "UNAUTHENTICATED"
    ) {
      console.warn("Chat API auth error: invalid Gemini API key.");

      return response.status(geminiStatus === 400 ? 400 : 401).json({
        error: invalidKeyMessage,
      });
    }

    if (geminiStatus === 429) {
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
