import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAIHandler {
  async chat(message: string) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a travel assistant. Help users plan their trips by providing information about destinations.
            When a location is mentioned, include it in the JSON response.
            Respond in JSON format with: { "message": { "role": "assistant", "content": "your response", "timestamp": timestamp }, "location": "mentioned location" }`
          },
          {
            role: "user",
            content: message
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error("Failed to process message: " + error.message);
    }
  }
}
