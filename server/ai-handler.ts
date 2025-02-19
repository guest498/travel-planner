import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class AIHandler {
  async chat(message: string) {
    try {
      // Use a simpler, more accessible model
      const response = await hf.textGeneration({
        model: 'gpt2',
        inputs: `As a travel assistant, help with: ${message}. 
                If a location is mentioned, provide travel information.
                Keep the response concise and friendly.`,
        parameters: {
          max_length: 150,
          temperature: 0.7,
        }
      });

      // Extract location using simple keyword matching for now
      // since NER might be unavailable
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

      // Check for specific API key errors
      if (error instanceof Error && error.message.includes('Invalid credentials')) {
        throw new Error('AI service configuration error. Please ensure API key is set correctly.');
      }

      throw new Error('Failed to process message. Please try again.');
    }
  }
}