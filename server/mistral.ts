import type { Message } from '@shared/schema';

const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

export class MistralHandler {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  async chat(message: string) {
    try {
      const response = await fetch(MISTRAL_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content: `You are a friendly travel assistant. Keep your responses extremely brief and only focus on:
1. Very brief comment about the location (1 short sentence)
2. Quick overview of flight options (1-2 flight options with prices)

Example response: "Paris is the beautiful capital of France. Direct flights available from $400 (8h) or $550 (7h) with Air France."

Keep it conversational and simple. No extra details about culture, weather, or other topics.`
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mistral API error: ${error}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      return {
        message: {
          role: 'assistant',
          content: assistantMessage,
          timestamp: Date.now()
        },
        location: this.extractLocation(message)
      };
    } catch (error) {
      console.error('Mistral API error:', error);
      throw new Error('Failed to process message: ' + (error as Error).message);
    }
  }

  private extractLocation(message: string): string | null {
    // Simple location extraction from common patterns
    const patterns = [
      /(?:visit|travel to|go to|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:travel|visit|information)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }
}