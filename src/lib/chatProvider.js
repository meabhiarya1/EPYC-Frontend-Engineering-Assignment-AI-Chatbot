export async function getAgentReply(message, history, config) {
  if (!config.apiKey && !config.endpoint) {
    return getMockReply(message);
  }

  if (config.endpoint) {
    return callBackendEndpoint(message, history, config.endpoint);
  }

  return callOpenAiCompatibleEndpoint(message, history, config);
}

async function callBackendEndpoint(message, history, endpoint) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error("Backend chat endpoint failed");
  }

  const data = await response.json();

  if (!data.reply) {
    throw new Error("Backend chat endpoint did not return a reply");
  }

  return data.reply;
}

async function callOpenAiCompatibleEndpoint(message, history, config) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            config.systemPrompt ??
            "You are a concise UI agent embedded inside a web application.",
        },
        ...history.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error("Model request failed");
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error("Model response was empty");
  }

  return reply;
}

async function getMockReply(message) {
  await new Promise((resolve) => window.setTimeout(resolve, 850));

  return [
    `I can help with "${message}".`,
    "For now I am running in demo mode because no API key or backend endpoint is configured.",
    "Add environment variables to connect a real model.",
  ].join(" ");
}
