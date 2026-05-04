import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb, settingsTable } from "../_lib/db.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Admin-Key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    const db = getDb();
    const settings = await db.select().from(settingsTable).where(eq(settingsTable.key, "store_info")).limit(1);
    const storeInfo = settings[0]?.value as any;
    const knowledgeBase = storeInfo?.siAiKnowledgeBase || "Be Simple 75 is a premium streetwear brand in Bangladesh focusing on oversized t-shirts.";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // History for Gemini (excluding system prompt logic which we'll prepend)
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const systemPrompt = `SYSTEM INSTRUCTIONS:
You are the Official AI Support for Be Simple 75.
Your persona: Cool, helpful, streetwear-savvy.
Knowledge Base: ${knowledgeBase}

RULES:
1. Be concise. Use emojis occasionally.
2. If the user wants to talk to a human, or if you can't solve their specific order/payment issue, suggest they click the "Talk to Human" button.
3. Don't make up info not in the knowledge base.
4. Keep the vibe premium.`;
    
    const lastMessage = messages[messages.length - 1].content;
    const prompt = messages.length === 1 
      ? `${systemPrompt}\n\nUser: ${lastMessage}`
      : lastMessage;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ content: text });
  } catch (err) {
    console.error("AI Chat error:", err);
    return res.status(500).json({ error: "Failed to process chat. Make sure GEMINI_API_KEY is valid." });
  }
}
