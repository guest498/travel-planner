import { MistralHandler } from './mistral';

export class AIHandler {
  private mistral: MistralHandler;

  constructor() {
    this.mistral = new MistralHandler();
  }

  async chat(message: string) {
    try {
      return await this.mistral.chat(message);
    } catch (error) {
      console.error('AI Handler error:', error);
      throw new Error('Failed to process message. Please try again.');
    }
  }
}