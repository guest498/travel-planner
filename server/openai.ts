import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAIHandler {
  async chat(message: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",  // Changed to GPT-3.5-turbo which is more widely available
        messages: [
          {
            role: "system",
            content: `You are a friendly travel assistant. Keep your responses extremely brief and only focus on:
1. Very brief comment about the location (1 short sentence)
2. Quick overview of flight options (1-2 flight options with prices)

Example response: "Paris is the beautiful capital of France. Direct flights available from $400 (8h) or $550 (7h) with Air France."

Keep it conversational and simple. No extra details about culture, weather, or other topics.
Respond in JSON format with: { "message": { "role": "assistant", "content": "your response", "timestamp": timestamp }, "location": "mentioned location" }`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" }
      });

      if (!response.choices[0].message.content) {
        throw new Error("No response content received");
      }

      const parsed = JSON.parse(response.choices[0].message.content);
      parsed.message.timestamp = Date.now();
      return parsed;
    } catch (error: any) {
      throw new Error("Failed to process message: " + error.message);
    }
  }
}