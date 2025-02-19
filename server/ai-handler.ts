export class AIHandler {
  async chat(message: string) {
    try {
      // Mock response that matches the expected format
      const response = {
        message: {
          role: 'assistant',
          content: this.getMockResponse(message),
          timestamp: Date.now()
        },
        location: this.extractLocation(message)
      };

      return response;
    } catch (error) {
      console.error('AI Handler error:', error);
      throw new Error('Failed to process message. Please try again.');
    }
  }

  private getMockResponse(message: string): string {
    const location = this.extractLocation(message);
    if (!location) {
      return "Hello! I'm your travel assistant. Where would you like to travel? I can help you find information about different destinations.";
    }

    return `${location} is a wonderful destination! You can find direct flights starting from $400. Would you like to know more about the weather, cultural aspects, or transportation options?`;
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