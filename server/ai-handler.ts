import { OpenAIHandler } from './openai';

export class AIHandler {
  private openai: OpenAIHandler;

  constructor() {
    this.openai = new OpenAIHandler();
  }

  async chat(message: string) {
    try {
      return await this.openai.chat(message);
    } catch (error) {
      console.error('AI Handler error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please ensure API key is set correctly.');
      }
      throw new Error('Failed to process message. Please try again.');
    }
  }
}