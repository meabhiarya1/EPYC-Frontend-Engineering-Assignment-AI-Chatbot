export async function getAgentReply(message, history, config) {
  if (!config.endpoint) {
    return getMockReply(message);
  }

  return callBackendEndpoint(message, history, config.endpoint);
}

async function callBackendEndpoint(message, history, endpoint) {
  const previousMessages = history.slice(0, -1);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history: previousMessages }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Backend chat endpoint failed");
  }

  if (!data.reply) {
    throw new Error("Backend chat endpoint did not return a reply");
  }

  return data.reply;
}

async function getMockReply(message) {
  await new Promise((resolve) => window.setTimeout(resolve, 850));

  return [
    `I can help with "${message}".`,
    "For now I am running in demo mode because no API key or backend endpoint is configured.",
    "Add environment variables to connect a real model.",
  ].join(" ");
}
