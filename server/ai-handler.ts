import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class AIHandler {
  async chat(message: string) {
    try {
      const response = await hf.textGeneration({
        model: 'gpt2',
        inputs: `You are a friendly travel assistant. Keep your responses simple and focused on:
                - Basic information about the location
                - Available flights and approximate prices
                Respond about: ${message}
                Keep it brief and conversational.`,
        parameters: {
          max_length: 100,
          temperature: 0.7,
        }
      });

      // Extract location using simple keyword matching
      const words = message.split(' ');
      const location = words.find(word => 
        word.length > 3 && /^[A-Z]/.test(word)
      ) || null;

      return {
        message: {
          role: 'assistant',
          content: response.generated_text.trim(),
          timestamp: Date.now()
        },
        location
      };
    } catch (error) {
      console.error('AI Handler error:', error);
      if (error instanceof Error && error.message.includes('Invalid credentials')) {
        throw new Error('AI service configuration error. Please ensure API key is set correctly.');
      }
      throw new Error('Failed to process message. Please try again.');
    }
  }
}