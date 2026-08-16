import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function POST(request) {
  const response = await authenticatedFetch("ai/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
  const relayed = await passThrough(response);
  const conversationId = response.headers.get("x-conversation-id");
  if (conversationId) relayed.headers.set("x-conversation-id", conversationId);
  return relayed;
}
